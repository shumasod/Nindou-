"use client";
import { C, S } from "../styles";
import { ITEMS, SKILLS, SKILL_UNLOCK } from "../data";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

export default function VictoryScreen({ state, dispatch }: Props) {
  const { ui, player, battle, progress } = state;
  const reward = ui.lastReward;
  const totalKills = Object.values(progress.questProgress).reduce((a, b) => a + b, 0);

  const nextSkill = player.clan
    ? Object.entries(SKILL_UNLOCK)
        .filter(([sid, u]) => u.clan === player.clan && !player.skills.includes(sid))
        .sort((a, b) => a[1].level - b[1].level)[0]
    : null;

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

        {/* 討伐サマリー */}
        <div style={{ ...S.panelSm, marginBottom: "24px" }}>
          <p style={{ ...S.label, marginBottom: "8px" }}>討伐記録</p>
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div>
              <p style={{ color: C.success, fontSize: "20px", margin: "0 0 2px", fontWeight: "bold" }}>
                {battle.killCount}
              </p>
              <p style={{ color: C.dim, fontSize: "11px", margin: 0 }}>この任務</p>
            </div>
            <div style={{ borderLeft: `1px solid ${C.border}` }} />
            <div>
              <p style={{ color: C.accent2, fontSize: "20px", margin: "0 0 2px", fontWeight: "bold" }}>
                {totalKills}
              </p>
              <p style={{ color: C.dim, fontSize: "11px", margin: 0 }}>累計討伐</p>
            </div>
            <div style={{ borderLeft: `1px solid ${C.border}` }} />
            <div>
              <p style={{ color: C.purple, fontSize: "20px", margin: "0 0 2px", fontWeight: "bold" }}>
                {progress.completedQuests.length}
              </p>
              <p style={{ color: C.dim, fontSize: "11px", margin: 0 }}>任務完了</p>
            </div>
          </div>
        </div>

        {/* 次スキル解放ヒント */}
        {nextSkill && (
          <div style={{ ...S.panelSm, marginBottom: "24px", borderColor: C.purple }}>
            <p style={{ ...S.label, marginBottom: "6px", color: C.purple }}>次のスキル解放</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.text, fontSize: "13px" }}>{SKILLS[nextSkill[0]]?.name ?? nextSkill[0]}</span>
              <span style={{ color: C.dim, fontSize: "11px" }}>Lv{nextSkill[1].level} で習得</span>
            </div>
            {player.level < nextSkill[1].level && (
              <div style={{ marginTop: "6px", background: C.border, borderRadius: "4px", height: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.round((player.level / nextSkill[1].level) * 100)}%`,
                    height: "100%",
                    background: C.purple,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            )}
          </div>
        )}

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
