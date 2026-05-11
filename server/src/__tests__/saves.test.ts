import request from "supertest";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";

// Use a temp DB for tests
const TEST_DB_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nindou-test-"));
process.env.DB_DIR = TEST_DB_DIR;
process.env.REDIS_URL = "redis://localhost:6379"; // won't connect; redis degrades gracefully
process.env.ALLOWED_ORIGIN = "http://localhost:3000";

// Import app after env vars are set
// eslint-disable-next-line @typescript-eslint/no-require-imports
const app = require("../index").default;

const VALID_SAVE = {
  currentSceneId: "scene_work_001",
  day: 1,
  timeOfDay: "night",
  params: { empathy: 50, ambition: 50, loneliness: 30, honesty: 50 },
  characterDistances: { aoi: 70, mio: 45, kenji: 80, rin: 95, daichi: 100, saki: 90 },
  unsentMessages: [],
  visitedScenes: [],
  gameOver: false,
};

afterAll(() => {
  fs.rmSync(TEST_DB_DIR, { recursive: true, force: true });
});

describe("GET /health", () => {
  it("returns 200 with sqlite ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.checks.sqlite).toBe("ok");
  });
});

describe("POST /saves/:slot", () => {
  it("saves valid data to slot 1", async () => {
    const res = await request(app).post("/saves/1").send(VALID_SAVE);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.id).toMatch(/^save_1_/);
  });

  it("rejects slot 0 (out of range)", async () => {
    const res = await request(app).post("/saves/0").send(VALID_SAVE);
    expect(res.status).toBe(400);
  });

  it("rejects slot 10 (out of range)", async () => {
    const res = await request(app).post("/saves/10").send(VALID_SAVE);
    expect(res.status).toBe(400);
  });

  it("rejects missing currentSceneId", async () => {
    const { currentSceneId: _, ...bad } = VALID_SAVE;
    const res = await request(app).post("/saves/1").send(bad);
    expect(res.status).toBe(400);
  });

  it("rejects empty currentSceneId", async () => {
    const res = await request(app).post("/saves/1").send({ ...VALID_SAVE, currentSceneId: "" });
    expect(res.status).toBe(400);
  });
});

describe("GET /saves/:slot", () => {
  beforeAll(async () => {
    await request(app).post("/saves/2").send({ ...VALID_SAVE, day: 3 });
  });

  it("returns saved data for slot 2", async () => {
    const res = await request(app).get("/saves/2");
    expect(res.status).toBe(200);
    expect(res.body.day).toBe(3);
  });

  it("returns 404 for empty slot 9", async () => {
    const res = await request(app).get("/saves/9");
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid slot", async () => {
    const res = await request(app).get("/saves/abc");
    expect(res.status).toBe(400);
  });
});

describe("GET /saves", () => {
  it("lists all save slots", async () => {
    const res = await request(app).get("/saves");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("DELETE /saves/:slot", () => {
  beforeAll(async () => {
    await request(app).post("/saves/3").send(VALID_SAVE);
  });

  it("deletes slot 3", async () => {
    const del = await request(app).delete("/saves/3");
    expect(del.status).toBe(200);
    expect(del.body.ok).toBe(true);

    const get = await request(app).get("/saves/3");
    expect(get.status).toBe(404);
  });

  it("returns 400 for invalid slot on delete", async () => {
    const res = await request(app).delete("/saves/0");
    expect(res.status).toBe(400);
  });
});
