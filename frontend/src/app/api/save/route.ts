import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const SAVE_DIR = join(process.cwd(), ".saves");
const SAVE_FILE = join(SAVE_DIR, "slot1.json");

const MAX_BODY_BYTES = 100 * 1024;

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "ペイロードが大きすぎます" }, { status: 413 });
    }

    const body = await req.json();

    if (!body || typeof body.currentSceneId !== "string" || body.currentSceneId.length === 0) {
      return NextResponse.json({ ok: false, error: "不正なデータ形式" }, { status: 400 });
    }

    mkdirSync(SAVE_DIR, { recursive: true });
    writeFileSync(SAVE_FILE, JSON.stringify({ ...body, savedAt: Date.now() }, null, 2));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
