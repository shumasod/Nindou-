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

const PRESET_NAMES: Record<string, string[]> = {
  force:    ["影鬼", "蒼鬼", "烈火", "轟雷", "鉄拳"],
  illusion: ["幻夜", "霞影", "月詠", "紫炎", "夢幻"],
  speed:    ["疾風", "閃光", "迅雷", "朱雀", "燕飛"],
};

// 許可文字: ひらがな・カタカナ・漢字・英数字・スペース・ハイフン・アンダースコア
// 制御文字・HTML特殊文字・方向制御文字(RLO等)は拒否する
const VALID_NAME_RE = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF\w\s\-_]+$/;

/** 入力文字列から危険な文字を除去して返す */
function sanitizeName(raw: string): string {
  return raw
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "") // 方向制御文字を除去
    .replace(/[<>"'`]/g, "")                       // HTML特殊文字を除去
    .replace(/[\x00-\x1F\x7F]/g, "");             // 制御文字を除去
}

export default function NameInputScreen({ clan, dispatch }: Props) {
  const [name, setName] = useState("");
  const clanData = CLANS[clan];

  const trimmed = name.trim();
  const isValidChars = trimmed.length === 0 || VALID_NAME_RE.test(trimmed);
  const canStart = trimmed.length >= 1 && trimmed.length <= 12 && isValidChars;

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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <button
            style={{ ...S.btn(C.dim), padding: "4px 10px", fontSize: "12px" }}
            onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "clan_select" })}
          >
            ← 流派へ戻る
          </button>
          <p style={{ ...S.label, margin: 0 }}>STEP 2 / 2</p>
        </div>
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
            style={{
              ...S.input,
              borderColor: trimmed.length > 0 && !isValidChars ? C.accent1 : undefined,
            }}
            value={name}
            onChange={(e) => setName(sanitizeName(e.target.value))}
            maxLength={12}
            placeholder="例：影丸、疾風..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && canStart) {
                dispatch({ type: "SET_NAME", name: trimmed });
              }
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            {trimmed.length > 0 && !isValidChars ? (
              <p style={{ color: C.accent1, fontSize: "11px", margin: 0 }}>
                使用できない文字が含まれています（漢字・かな・英数字のみ）
              </p>
            ) : <span />}
            <span style={{ color: trimmed.length > 10 ? C.accent1 : C.dim, fontSize: "11px" }}>
              {trimmed.length} / 12
            </span>
          </div>
        </div>

        {/* 名前候補 */}
        {(() => {
          const presets = PRESET_NAMES[clan] ?? [];
          return presets.length > 0 ? (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ ...S.label, marginBottom: "6px" }}>名前の候補</p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {presets.map((p) => (
                  <button
                    key={p}
                    style={{
                      ...S.btn(clanData.color),
                      padding: "4px 10px",
                      fontSize: "12px",
                      letterSpacing: "0.05em",
                    }}
                    onClick={() => setName(p)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = clanData.color; e.currentTarget.style.color = C.bg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = clanData.color; }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* フレーバーテキスト */}
        {canStart && (
          <div style={{ ...S.panelSm, marginBottom: "24px", animation: "fadeIn 0.4s ease" }}>
            <p style={{ color: C.dim, fontSize: "13px", lineHeight: 1.8 }}>
              <span style={{ color: clanData.color }}>「{trimmed}」</span>
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
          onClick={() => dispatch({ type: "SET_NAME", name: trimmed })}
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
