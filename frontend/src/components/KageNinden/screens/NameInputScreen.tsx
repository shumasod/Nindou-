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
          {trimmed.length > 0 && !isValidChars && (
            <p style={{ color: C.accent1, fontSize: "11px", marginTop: "4px" }}>
              使用できない文字が含まれています（漢字・かな・英数字のみ）
            </p>
          )}
        </div>

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
