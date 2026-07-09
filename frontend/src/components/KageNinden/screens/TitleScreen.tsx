"use client";
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { C, S } from "../styles";
import type { GameAction } from "../reducer";

interface Props {
  dispatch: (a: GameAction) => void;
}

const TIPS = [
  "奇襲が成功すると敵が1ターン行動不能になる",
  "防御コマンドを使うとダメージを半減できる",
  "チャクラはターンごとに少量回復する",
  "技能を使うとチャクラを消費するが高威力",
  "クエスト完了でボーナス報酬を獲得できる",
  "速さが高いほど先手を取りやすい",
];

export default function TitleScreen({ dispatch }: Props) {
  const [hasSave, setHasSave] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    try {
      setHasSave(!!localStorage.getItem("kage_ninden_save"));
    } catch {}
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

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
      <div style={{ textAlign: "center", animation: "fadeIn 1.2s ease", marginBottom: "40px" }}>
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

        {/* セーブデータインジケーター */}
        <div style={{ marginTop: "12px", fontSize: "11px", color: hasSave ? C.success : C.dim }}>
          {hasSave ? "💾 セーブデータ: あり" : "💾 セーブデータ: なし"}
        </div>
      </div>

      {/* メニュー */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "240px", animation: "slideUp 1s ease 0.4s both" }}>
        <button
          style={menuBtnStyle(C.accent2)}
          onMouseEnter={(e) => hoverOn(e, C.accent2)}
          onMouseLeave={(e) => hoverOff(e, C.accent2)}
          onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "clan_select" })}
        >
          ▶　新しい冒険
        </button>
        <button
          style={{ ...menuBtnStyle(C.dim), fontSize: "13px", padding: "8px 24px" }}
          onMouseEnter={(e) => hoverOn(e, C.dim)}
          onMouseLeave={(e) => hoverOff(e, C.dim)}
          onClick={() => setShowTips((v) => !v)}
        >
          ？　操作説明
        </button>
      </div>

      {/* Tips パネル */}
      {showTips && (
        <div
          style={{
            marginTop: "24px",
            width: "280px",
            ...S.panel,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <p style={{ ...S.label, marginBottom: "8px" }}>操作ヒント</p>
          <p style={{ color: C.text, fontSize: "13px", lineHeight: 1.7, minHeight: "42px", transition: "all 0.3s" }}>
            💡 {TIPS[tipIndex]}
          </p>
          <p style={{ color: C.dim, fontSize: "11px", marginTop: "8px" }}>
            {tipIndex + 1} / {TIPS.length} — 自動で切り替わります
          </p>
        </div>
      )}

      {/* 下部装飾 */}
      <p style={{ position: "absolute", bottom: "20px", color: C.dim, fontSize: "11px", letterSpacing: "0.1em" }}>
        ｜ 影忍伝 ─ Kage Ninden ｜ v1.0
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

function menuBtnStyle(color: string): CSSProperties {
  return {
    ...S.btn(color),
    padding: "12px 24px",
    fontSize: "15px",
    letterSpacing: "0.15em",
    width: "100%",
  };
}

function hoverOn(e: React.MouseEvent<HTMLButtonElement>, color: string) {
  const el = e.currentTarget;
  el.style.background = color;
  el.style.color = C.bg;
}
function hoverOff(e: React.MouseEvent<HTMLButtonElement>, color: string) {
  const el = e.currentTarget;
  el.style.background = "transparent";
  el.style.color = color;
}
