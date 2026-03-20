"use client";
import type { CSSProperties } from "react";
import { C, S } from "../styles";
import type { GameAction } from "../reducer";

interface Props {
  dispatch: (a: GameAction) => void;
}

export default function TitleScreen({ dispatch }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 背景装飾 */}
      <div style={bgDeco} />

      {/* タイトルブロック */}
      <div style={{ textAlign: "center", animation: "fadeIn 1.2s ease", marginBottom: "48px" }}>
        <p style={{ color: C.dim, fontSize: "11px", letterSpacing: "0.4em", marginBottom: "12px" }}>
          ── NINJA RPG ──
        </p>

        {/* アスキーアート風タイトル */}
        <pre style={{ color: C.accent2, fontSize: "clamp(10px,2vw,14px)", lineHeight: 1.4, margin: "0 0 8px" }}>
{`╔═══════════════════════════╗
║  ██╗  ██╗ █████╗  ██████╗ ║
║  ██║ ██╔╝██╔══██╗██╔════╝ ║
║  █████╔╝ ███████║██║  ███╗║
║  ██╔═██╗ ██╔══██║██║   ██║║
║  ██║  ██╗██║  ██║╚██████╔╝║
║  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ║
╚═══════════════════════════╝`}
        </pre>

        <h1 style={{ fontSize: "clamp(24px,5vw,40px)", letterSpacing: "0.3em", color: C.text, margin: "8px 0 4px" }}>
          影忍伝
        </h1>
        <p style={{ color: C.dim, fontSize: "13px", letterSpacing: "0.25em" }}>
          ─ Kage Ninden ─
        </p>

        <div style={{ marginTop: "16px", color: C.dim, fontSize: "12px", lineHeight: 1.8 }}>
          <p>闇に生き、影に死す。</p>
          <p>これが真の忍の道。</p>
        </div>
      </div>

      {/* メニュー */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "220px", animation: "slideUp 1s ease 0.4s both" }}>
        <button
          style={menuBtnStyle}
          onMouseEnter={(e) => hoverOn(e)}
          onMouseLeave={(e) => hoverOff(e)}
          onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "clan_select" })}
        >
          ▶　冒険を始める
        </button>
      </div>

      {/* 下部装飾 */}
      <p style={{ position: "absolute", bottom: "20px", color: C.dim, fontSize: "11px", letterSpacing: "0.1em" }}>
        ｜ 影忍伝 ─ Kage Ninden ｜
      </p>
    </div>
  );
}

const bgDeco: CSSProperties = {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundImage: `
    radial-gradient(ellipse at 20% 20%, rgba(196,30,30,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(122,75,181,0.04) 0%, transparent 60%)
  `,
  pointerEvents: "none",
};

const menuBtnStyle: CSSProperties = {
  ...S.btn(C.accent2),
  padding: "12px 24px",
  fontSize: "15px",
  letterSpacing: "0.15em",
  width: "100%",
};

function hoverOn(e: React.MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.background = C.accent2;
  el.style.color = C.bg;
}
function hoverOff(e: React.MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.background = "transparent";
  el.style.color = C.accent2;
}
