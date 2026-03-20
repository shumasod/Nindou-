"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import { C, S } from "../styles";
import { CLANS } from "../data";
import type { ClanId } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  clan: ClanId;
  dispatch: (a: GameAction) => void;
}

export default function NameInputScreen({ clan, dispatch }: Props) {
  const [name, setName] = useState("");
  const clanData = CLANS[clan];

  const canStart = name.trim().length >= 1 && name.trim().length <= 12;

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
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", animation: "slideUp 0.8s ease" }}>
        <p style={S.label}>STEP 2 / 2</p>
        <h2 style={{ ...S.title, fontSize: "22px", margin: "8px 0 24px" }}>｜ 名を刻め ｜</h2>

        {/* 流派確認 */}
        <div style={{ ...S.panelSm, marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>{clanData.icon}</span>
          <div>
            <p style={S.label}>選択した流派</p>
            <p style={{ color: clanData.color, fontSize: "16px", fontWeight: "bold" }}>{clanData.name}</p>
          </div>
        </div>

        {/* 名前入力 */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ ...S.label, display: "block", marginBottom: "8px" }}>
            忍者名（1〜12文字）
          </label>
          <input
            style={S.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            placeholder="例：影丸、疾風..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && canStart) {
                dispatch({ type: "SET_NAME", name: name.trim() });
              }
            }}
          />
        </div>

        {/* フレーバーテキスト */}
        {name.trim() && (
          <div style={{ ...S.panelSm, marginBottom: "24px", animation: "fadeIn 0.4s ease" }}>
            <p style={{ color: C.dim, fontSize: "13px", lineHeight: 1.8 }}>
              <span style={{ color: clanData.color }}>「{name.trim()}」</span>
              、{clanData.name}の修行が始まる。<br />
              影の道を歩み、真の忍へと成長せよ。
            </p>
          </div>
        )}

        {/* 旅立ちボタン */}
        <button
          style={
            canStart
              ? { ...S.btn(C.accent2), width: "100%", padding: "12px", fontSize: "16px" }
              : { ...S.btnDisabled, width: "100%", padding: "12px", fontSize: "16px" }
          }
          disabled={!canStart}
          onClick={() => dispatch({ type: "SET_NAME", name: name.trim() })}
          onMouseEnter={(e) => canStart && hoverOn(e)}
          onMouseLeave={(e) => canStart && hoverOff(e)}
        >
          ▶　旅立ち
        </button>
      </div>
    </div>
  );
}

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
