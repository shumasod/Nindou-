import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Database setup
const DB_DIR = path.join(__dirname, "../../.db");
fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(path.join(DB_DIR, "nindou.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS saves (
    id TEXT PRIMARY KEY,
    slot INTEGER NOT NULL DEFAULT 1,
    data TEXT NOT NULL,
    saved_at INTEGER NOT NULL
  );
`);

// Routes

// GET /saves/:slot - Load save
app.get("/saves/:slot", (req, res) => {
  const slot = parseInt(req.params.slot ?? "1", 10);
  const row = db
    .prepare("SELECT data FROM saves WHERE slot = ? ORDER BY saved_at DESC LIMIT 1")
    .get(slot) as { data: string } | undefined;

  if (!row) {
    return res.status(404).json({ error: "セーブデータが見つかりません" });
  }

  try {
    return res.json(JSON.parse(row.data));
  } catch {
    return res.status(500).json({ error: "セーブデータの読み込みに失敗しました" });
  }
});

// POST /saves/:slot - Save game
app.post("/saves/:slot", (req, res) => {
  const slot = parseInt(req.params.slot ?? "1", 10);
  const data = req.body;

  if (!data || !data.currentSceneId) {
    return res.status(400).json({ error: "不正なデータ形式" });
  }

  const id = `save_${slot}_${Date.now()}`;
  const savedAt = Date.now();

  // Delete old save for this slot
  db.prepare("DELETE FROM saves WHERE slot = ?").run(slot);

  // Insert new save
  db.prepare(
    "INSERT INTO saves (id, slot, data, saved_at) VALUES (?, ?, ?, ?)"
  ).run(id, slot, JSON.stringify(data), savedAt);

  return res.json({ ok: true, id, savedAt });
});

// GET /saves - List all save slots
app.get("/saves", (_req, res) => {
  const rows = db
    .prepare(
      "SELECT slot, saved_at, json_extract(data, '$.day') as day, json_extract(data, '$.currentSceneId') as scene FROM saves ORDER BY slot"
    )
    .all() as Array<{ slot: number; saved_at: number; day: number; scene: string }>;

  return res.json(
    rows.map((r) => ({
      slot: r.slot,
      savedAt: r.saved_at,
      day: r.day,
      scene: r.scene,
    }))
  );
});

// DELETE /saves/:slot - Delete save
app.delete("/saves/:slot", (req, res) => {
  const slot = parseInt(req.params.slot ?? "1", 10);
  db.prepare("DELETE FROM saves WHERE slot = ?").run(slot);
  return res.json({ ok: true });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🎮 Nindou Server running on http://localhost:${PORT}`);
});

export default app;
