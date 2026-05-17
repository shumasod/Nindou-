import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SERVER_URL = process.env.SERVER_URL;
const SAVE_FILE = join(process.cwd(), ".saves", "slot1.json");

export async function GET() {
  try {
    // Docker: proxy to Express server
    if (SERVER_URL) {
      const upstream = await fetch(`${SERVER_URL}/saves/1`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!upstream.ok) return NextResponse.json(null, { status: upstream.status });
      const data = await upstream.json();
      return NextResponse.json(data);
    }

    // Local dev fallback: read from filesystem
    if (!existsSync(SAVE_FILE)) {
      return NextResponse.json(null, { status: 404 });
    }
    const raw = readFileSync(SAVE_FILE, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "読み込みに失敗しました" }, { status: 500 });
  }
}
