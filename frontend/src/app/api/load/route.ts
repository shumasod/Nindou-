import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SAVE_FILE = join(process.cwd(), ".saves", "slot1.json");

export async function GET() {
  try {
    if (!existsSync(SAVE_FILE)) {
      return NextResponse.json(null, { status: 404 });
    }
    const raw = readFileSync(SAVE_FILE, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
