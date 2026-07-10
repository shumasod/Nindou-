"use client";
import { C, S } from "../styles";
import { ITEMS, QUESTS } from "../data";
import { rankColor } from "../utils";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

function performanceGrade(hpRatio: number): { grade: string; color: string; msg: string } {
  if (hpRatio >= 0.8) return { grade: "S", color: C.accent2,  msg: "完璧な任務遂行だ！" };
  if (hpRatio >= 0.5) return { grade: "A", color: C.success,  msg: "見事な戦いぶりだ。" };
  if (hpRatio >= 0.25) return { grade: "B", color: C.chakra,  msg: "良くやった。まだ伸びしろがある。" };
  if (hpRatio > 0)    return { grade: "C", color: C.text,     msg: "生き延びたことで十分だ。" };
  return                      { grade: "D", color: C.dim,      msg: "次は慎重に戦え。" };
}

export default function VictoryScreen({ state, dispatch }: Props) {
  const { ui, player, progress } = state;
  const reward = ui.lastReward;

  // Find the last completed quest
  const lastQuestId = progress.completedQuests[progress.completedQuests.length - 1];
  const completedQuest = lastQuestId ? QUESTS.find((q) => q.id === lastQuestId) : null;

  // Next available quest recommendation
  const nextQuest = QUESTS.find(
    (q) => !progress.completedQuests.includes(q.id) && player.level >= q.minLevel
  );

  const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 0;
  const perf = performanceGrade(hpRatio);

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
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <p style={{ color: C.accent2, fontSize: "40px", margin: "0 0 8px", letterSpacing: "0.2em" }}>
            ── 任務完了 ──
          </p>
          <p style={{ color: C.success, fontSize: "16px", letterSpacing: "0.15em" }}>
            MISSION COMPLETE
          </p>

          {/* Completed quest rank badge */}
          {completedQuest && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span
                style={{
                  color: rankColor(completedQuest.rank),
                  border: `1px solid ${rankColor(completedQuest.rank)}`,
                  padding: "2px 10px",
                  fontSize: "14px",
                  borderRadius: "2px",
                }}
              >
                {completedQuest.rank}ランク
              </span>
              <span style={{ color: C.text, fontSize: "15px", fontWeight: "bold" }}>
                {completedQuest.title}
              </span>
            </div>
          )}

          {/* Performance grade */}
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <span
              style={{
                color: perf.color,
                border: `2px solid ${perf.color}`,
                padding: "4px 14px",
                fontSize: "22px",
                fontWeight: "bold",
                borderRadius: "4px",
                animation: perf.grade === "S" ? "pulse 1.5s infinite" : "none",
              }}
            >
              {perf.grade}
            </span>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: perf.color, fontSize: "13px", margin: 0 }}>{perf.msg}</p>
              <p style={{ color: C.dim, fontSize: "11px", margin: "2px 0 0" }}>
                残りHP: {player.hp} / {player.maxHp} ({Math.round(hpRatio * 100)}%)
              </p>
            </div>
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

        {/* 次の任務推薦 */}
        {nextQuest && (
          <div
            style={{
              ...S.panelSm,
              marginBottom: "20px",
              border: `1px solid ${C.accent2}44`,
              background: `${C.accent2}08`,
            }}
          >
            <p style={{ ...S.label, marginBottom: "6px" }}>次の推薦任務</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  color: rankColor(nextQuest.rank),
                  border: `1px solid ${rankColor(nextQuest.rank)}`,
                  padding: "1px 6px",
                  fontSize: "11px",
                  borderRadius: "2px",
                }}
              >
                {nextQuest.rank}
              </span>
              <span style={{ color: C.text, fontSize: "13px" }}>{nextQuest.title}</span>
              <span style={{ color: C.dim, fontSize: "11px", marginLeft: "auto" }}>
                Lv.{nextQuest.minLevel}+
              </span>
            </div>
            <p style={{ color: C.dim, fontSize: "11px", margin: "4px 0 0", lineHeight: 1.5 }}>
              {nextQuest.desc.slice(0, 48)}…
            </p>
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
