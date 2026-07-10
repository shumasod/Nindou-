"use client";
import { C, S } from "../styles";
import { AREAS, QUESTS } from "../data";
import { rankColor } from "../utils";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

function ninjaRank(completedCount: number): { title: string; color: string } {
  if (completedCount >= 5) return { title: "影",   color: C.accent2 };
  if (completedCount >= 3) return { title: "上忍", color: C.purple };
  if (completedCount >= 1) return { title: "中忍", color: C.success };
  return                          { title: "下忍", color: C.dim };
}

export default function MapScreen({ state, dispatch }: Props) {
  const { player, progress } = state;
  const totalQuests = QUESTS.length;
  const completedCount = progress.completedQuests.length;
  const completePct = totalQuests > 0 ? Math.round((completedCount / totalQuests) * 100) : 0;
  const rank = ninjaRank(completedCount);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "monospace",
        padding: "16px",
      }}
    >
      {/* ヘッダー */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", borderBottom: `1px solid ${C.border}`, paddingBottom: "12px" }}>
        <button
          style={{ ...S.btn(C.dim), padding: "6px 12px", fontSize: "12px" }}
          onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "home" })}
        >
          ← 里へ
        </button>
        <h2 style={{ color: C.accent2, margin: 0, fontSize: "18px", letterSpacing: "0.15em" }}>
          ｜ フィールドマップ ｜
        </h2>
      </div>

      {/* 全体進捗サマリー */}
      <div style={{ ...S.panelSm, marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span
              style={{
                color: rank.color,
                border: `1px solid ${rank.color}`,
                padding: "1px 8px",
                fontSize: "12px",
                borderRadius: "2px",
              }}
            >
              {rank.title}
            </span>
            <span style={{ color: C.dim, fontSize: "12px" }}>
              任務達成: <span style={{ color: C.text }}>{completedCount} / {totalQuests}</span>
            </span>
          </div>
          <span style={{ color: completePct === 100 ? C.accent2 : C.dim, fontSize: "12px" }}>
            {completePct}%
          </span>
        </div>
        <div style={{ height: "4px", background: `${C.dim}44`, borderRadius: "2px", overflow: "hidden" }}>
          <div
            style={{
              width: `${completePct}%`,
              height: "100%",
              background: completePct === 100 ? C.accent2 : C.success,
              borderRadius: "2px",
              transition: "width 0.5s",
            }}
          />
        </div>
      </div>

      <p style={{ color: C.dim, fontSize: "12px", marginBottom: "16px" }}>
        任務を選んで出陣せよ。Lv不足のエリアは進入不可。
      </p>

      {/* エリア一覧 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Object.entries(AREAS).map(([areaId, area]) => {
          const locked = player.level < area.minLevel;
          const areaQuests = QUESTS.filter((q) => area.quests.includes(q.id));

          return (
            <div
              key={areaId}
              style={{
                ...S.panel,
                opacity: locked ? 0.4 : 1,
                border: `1px solid ${locked ? C.border : C.border}`,
              }}
            >
              {/* エリアヘッダー */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "22px" }}>{area.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", color: locked ? C.dim : C.text }}>{area.name}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: C.dim }}>{area.desc}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {locked ? (
                    <span style={{ color: C.danger, fontSize: "11px" }}>🔒 Lv{area.minLevel}〜</span>
                  ) : (
                    <span style={{ color: C.success, fontSize: "11px" }}>解放済 Lv{area.minLevel}〜</span>
                  )}
                </div>
              </div>

              {/* クエスト一覧 */}
              {!locked && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {areaQuests.map((q) => {
                    const done = progress.completedQuests.includes(q.id);
                    const levelOk = player.level >= q.minLevel;
                    const isActive = progress.activeQuest?.id === q.id;
                    const canStart = !done && levelOk && !isActive;

                    return (
                      <div
                        key={q.id}
                        style={{
                          ...S.panelSm,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                          opacity: done ? 0.5 : 1,
                          background: done ? "#1a1a2a" : C.panel,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                            <span
                              style={{
                                color: rankColor(q.rank),
                                border: `1px solid ${rankColor(q.rank)}`,
                                padding: "1px 6px",
                                fontSize: "11px",
                                borderRadius: "2px",
                              }}
                            >
                              {q.rank}
                            </span>
                            <span style={{ fontSize: "13px", color: done ? C.dim : C.text }}>{q.title}</span>
                            {done && <span style={{ color: C.success, fontSize: "11px" }}>✓ 完了</span>}
                            {isActive && <span style={{ color: C.accent2, fontSize: "11px", animation: "blink 1s infinite" }}>► 進行中</span>}
                          </div>
                          <p style={{ margin: 0, fontSize: "11px", color: C.dim }}>{q.desc}</p>
                          <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                            <span style={{ color: C.accent2, fontSize: "11px" }}>EXP +{q.reward.exp}</span>
                            <span style={{ color: C.accent2, fontSize: "11px" }}>G +{q.reward.gold}</span>
                            {!levelOk && (
                              <span style={{ color: C.danger, fontSize: "11px" }}>Lv{q.minLevel}〜</span>
                            )}
                          </div>
                        </div>
                        {canStart && (
                          <button
                            style={{ ...S.btn(C.accent1), padding: "6px 12px", fontSize: "12px", whiteSpace: "nowrap" }}
                            onClick={() => dispatch({ type: "START_QUEST", questId: q.id })}
                            onMouseEnter={(e) => { e.currentTarget.style.background = C.accent1; e.currentTarget.style.color = C.bg; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.accent1; }}
                          >
                            出陣 ▶
                          </button>
                        )}
                        {done && (
                          <span style={{ color: C.success, fontSize: "20px" }}>✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
