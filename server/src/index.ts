import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Database from "better-sqlite3";
import Redis from "ioredis";
import path from "path";
import fs from "fs";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// In production, require explicit env vars; never fall back to insecure defaults.
const IS_PROD = process.env.NODE_ENV === "production";
if (IS_PROD && !process.env.ALLOWED_ORIGIN) {
  console.error("FATAL: ALLOWED_ORIGIN env var is required in production");
  process.exit(1);
}
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const DB_DIR = process.env.DB_DIR ?? path.join(__dirname, "../../.db");
const CACHE_TTL_SEC = 86_400; // 24h
const SAVE_SLOT_MIN = 1;
const SAVE_SLOT_MAX = 9;

// ===== Middleware =====
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  maxAge: 86400,
}));
app.use(express.json({ limit: "100kb" }));

// General API rate limit: 120 req/min per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Stricter limit for save writes: 20 req/min per IP
const saveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Disable X-Powered-By header
app.disable("x-powered-by");

// CSRF mitigation: reject cross-site state-changing requests that include a
// Sec-Fetch-Site header (set by all modern browsers) with a non-same-origin value.
// Old browsers that omit the header are allowed through (no downgrade).
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }
  const fetchSite = req.headers["sec-fetch-site"];
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") {
    return res.status(403).json({ error: "Cross-site request rejected" });
  }
  next();
});

// ===== Database =====
fs.mkdirSync(DB_DIR, { recursive: true });
const db = new Database(path.join(DB_DIR, "nindou.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS saves (
    id      TEXT    PRIMARY KEY,
    slot    INTEGER NOT NULL DEFAULT 1,
    data    TEXT    NOT NULL,
    saved_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_saves_slot ON saves(slot);
`);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

// ===== Redis =====
const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: 2,
  retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
});

redis.on("error", (err) => {
  console.error("[Redis] connection error:", err.message);
});

function cacheKey(slot: number): string {
  return `nindou:save:slot:${slot}`;
}

// ===== Helpers =====
function parseSlot(raw: string | undefined): number | null {
  const n = parseInt(raw ?? "", 10);
  if (isNaN(n) || n < SAVE_SLOT_MIN || n > SAVE_SLOT_MAX) return null;
  return n;
}

async function getFromCache(slot: number): Promise<object | null> {
  try {
    const cached = await redis.get(cacheKey(slot));
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    // Invalidate potentially poisoned cache entry, fall through to SQLite
    await invalidateCache(slot);
  }
  return null;
}

async function setCache(slot: number, data: object): Promise<void> {
  try {
    await redis.set(cacheKey(slot), JSON.stringify(data), "EX", CACHE_TTL_SEC);
  } catch {
    // キャッシュ書き込み失敗は無視 (SQLiteが正とする)
  }
}

async function invalidateCache(slot: number): Promise<void> {
  try {
    await redis.del(cacheKey(slot));
  } catch {
    // ignore
  }
}

// ===== Routes =====

// GET /saves/:slot — Load save (Redis first, SQLite fallback)
app.get("/saves/:slot", async (req, res) => {
  const slot = parseSlot(req.params.slot);
  if (slot === null) {
    return res.status(400).json({ error: "スロット番号は1〜9の整数で指定してください" });
  }

  const cached = await getFromCache(slot);
  if (cached) return res.json(cached);

  const row = db
    .prepare("SELECT data FROM saves WHERE slot = ? ORDER BY saved_at DESC LIMIT 1")
    .get(slot) as { data: string } | undefined;

  if (!row) return res.status(404).json({ error: "セーブデータが見つかりません" });

  try {
    const parsed = JSON.parse(row.data);
    await setCache(slot, parsed);
    return res.json(parsed);
  } catch {
    return res.status(500).json({ error: "セーブデータの読み込みに失敗しました" });
  }
});

// POST /saves/:slot — Save game (write-through cache)
app.post("/saves/:slot", saveLimiter, async (req, res) => {
  const slot = parseSlot(req.params.slot);
  if (slot === null) {
    return res.status(400).json({ error: "スロット番号は1〜9の整数で指定してください" });
  }

  const data = req.body;
  if (!data || typeof data.currentSceneId !== "string" || data.currentSceneId.length === 0) {
    return res.status(400).json({ error: "不正なデータ形式" });
  }

  const id = `save_${slot}_${Date.now()}`;
  const savedAt = Date.now();
  const payload = { ...data, savedAt };

  db.prepare("DELETE FROM saves WHERE slot = ?").run(slot);
  db.prepare("INSERT INTO saves (id, slot, data, saved_at) VALUES (?, ?, ?, ?)").run(
    id, slot, JSON.stringify(payload), savedAt
  );

  await setCache(slot, payload);
  return res.json({ ok: true, id, savedAt });
});

// GET /saves — List all save slots
app.get("/saves", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT slot, saved_at,
              json_extract(data, '$.day') AS day,
              json_extract(data, '$.currentSceneId') AS scene
       FROM saves ORDER BY slot`
    )
    .all() as Array<{ slot: number; saved_at: number; day: number; scene: string }>;

  return res.json(rows.map((r) => ({
    slot: r.slot,
    savedAt: r.saved_at,
    day: r.day,
    scene: r.scene,
  })));
});

// DELETE /saves/:slot — Delete save
app.delete("/saves/:slot", async (req, res) => {
  const slot = parseSlot(req.params.slot);
  if (slot === null) {
    return res.status(400).json({ error: "スロット番号は1〜9の整数で指定してください" });
  }
  db.prepare("DELETE FROM saves WHERE slot = ?").run(slot);
  await invalidateCache(slot);
  return res.json({ ok: true });
});

// GET /health — Health check (DB + Redis)
app.get("/health", async (_req, res) => {
  const checks: Record<string, string> = {};

  // SQLite check
  try {
    db.prepare("SELECT 1").get();
    checks.sqlite = "ok";
  } catch {
    checks.sqlite = "error";
  }

  // Redis check
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "degraded"; // Redis 障害でもサービス継続
  }

  const allOk = checks.sqlite === "ok";
  return res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    timestamp: Date.now(),
    checks,
  });
});

// ===== Server lifecycle =====
async function start(): Promise<void> {
  try {
    await redis.connect();
    const redisHost = new URL(REDIS_URL).hostname;
    console.log("[Redis] connected to", redisHost);
  } catch {
    console.warn("[Redis] unavailable — running without cache");
  }

  const server = app.listen(PORT, () => {
    console.log(`🎮 Nindou Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  function shutdown(signal: string) {
    console.log(`[${signal}] shutting down...`);
    server.close(async () => {
      try { await redis.quit(); } catch { /* ignore */ }
      db.close();
      console.log("Bye.");
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}

start();

export default app;
