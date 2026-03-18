import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const SAVE_DIR = join(process.cwd(), ".saves");
const SAVE_FILE = join(SAVE_DIR, "slot1.json");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    mkdirSync(SAVE_DIR, { recursive: true });
    writeFileSync(SAVE_FILE, JSON.stringify({ ...body, savedAt: Date.now() }, null, 2));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
