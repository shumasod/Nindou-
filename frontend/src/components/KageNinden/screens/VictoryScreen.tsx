"use client";
import { C, S } from "../styles";
import { ITEMS } from "../data";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

export default function VictoryScreen({ state, dispatch }: Props) {
  const { ui, player } = state;
  const reward = ui.lastReward;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "480px", width: "100%", animation: "slideUp 0.8s ease" }}>
        {/* 勝利ヘッダー */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ color: C.accent2, fontSize: "40px", margin: "0 0 8px", letterSpacing: "0.2em" }}>
            ── 任務完了 ──
          </p>
          <p style={{ color: C.success, fontSize: "16px", letterSpacing: "0.15em" }}>
            MISSION COMPLETE
          </p>
          <div
            style={{
              marginTop: "12px",
              padding: "8px",
              border: `1px solid ${C.success}`,
              borderRadius: "4px",
              color: C.success,
              fontSize: "14px",
            }}
          >
            見事な腕前だ、{player.name}。
          </div>
        </div>

        {/* 報酬表示 */}
        {reward && (
          <div style={{ ...S.panel, marginBottom: "24px" }}>
            <p style={{ ...S.label, marginBottom: "12px" }}>獲得報酬</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.dim, fontSize: "14px" }}>経験値</span>
                <span style={{ color: C.success, fontSize: "16px", fontWeight: "bold" }}>+{reward.exp} EXP</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.dim, fontSize: "14px" }}>ゴールド</span>
                <span style={{ color: C.accent2, fontSize: "16px", fontWeight: "bold" }}>+{reward.gold} G</span>
              </div>
              {reward.items.length > 0 && (
                <div>
                  <span style={{ color: C.dim, fontSize: "13px" }}>アイテム</span>
                  <div style={{ marginTop: "4px" }}>
                    {reward.items.map((name, i) => (
                      <p key={i} style={{ color: C.success, fontSize: "13px", margin: "2px 0" }}>
                        + {name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lvアップ通知 */}
        {ui.levelUpPending && (
          <div
            style={{
              ...S.panel,
              marginBottom: "24px",
              border: `1px solid ${C.accent2}`,
              background: `${C.accent2}15`,
              textAlign: "center",
              animation: "pulse 1.5s infinite",
            }}
          >
            <p style={{ color: C.accent2, fontSize: "20px", margin: "0 0 4px" }}>
              ⬆ Level Up! ⬆
            </p>
            <p style={{ color: C.text, fontSize: "16px", margin: 0 }}>
              Lv.{player.level} に上がった！
            </p>
            <p style={{ color: C.dim, fontSize: "12px", margin: "4px 0 0" }}>
              ステータスポイント {player.statPoints} 獲得
            </p>
          </div>
        )}

        {/* 現在ステータス */}
        <div style={{ ...S.panelSm, marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.dim, fontSize: "12px" }}>現在 Lv</span>
            <span style={{ color: C.text, fontSize: "12px" }}>{player.level}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            <span style={{ color: C.dim, fontSize: "12px" }}>EXP</span>
            <span style={{ color: C.text, fontSize: "12px" }}>{player.exp} / {player.expToNext}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            <span style={{ color: C.dim, fontSize: "12px" }}>所持金</span>
            <span style={{ color: C.accent2, fontSize: "12px" }}>{player.gold} G</span>
          </div>
        </div>

        {/* ボタン */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            style={{ ...S.btn(C.success), padding: "12px 28px", fontSize: "15px" }}
            onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "home" })}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.success; e.currentTarget.style.color = C.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.success; }}
          >
            里へ帰還 ▶
          </button>
          <button
            style={{ ...S.btn(C.accent1), padding: "12px 28px", fontSize: "15px" }}
            onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "map" })}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.accent1; e.currentTarget.style.color = C.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.accent1; }}
          >
            次の任務へ ▶
          </button>
        </div>
      </div>
    </div>
  );
}
