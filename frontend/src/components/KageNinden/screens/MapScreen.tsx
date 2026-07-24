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

export default function MapScreen({ state, dispatch }: Props) {
  const { player, progress } = state;

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
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", borderBottom: `1px solid ${C.border}`, paddingBottom: "12px" }}>
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
      {/* 進捗サマリー */}
      {(() => {
        const total = QUESTS.length;
        const done = progress.completedQuests.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div style={{ ...S.panelSm, marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ ...S.label, marginBottom: "4px" }}>任務進捗</p>
              <div style={{ background: C.border, borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: C.success, transition: "width 0.4s ease" }} />
              </div>
            </div>
            <span style={{ color: C.success, fontSize: "13px", whiteSpace: "nowrap" }}>
              {done} / {total} 完了
            </span>
          </div>
        );
      })()}

      <p style={{ color: C.dim, fontSize: "12px", marginBottom: "20px" }}>
        任務を選んで出陣せよ。Lv不足のエリアは進入不可。
      </p>

      {/* エリア一覧 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Object.entries(AREAS).map(([areaId, area]) => {
          const locked = player.level < area.minLevel;
          const areaQuests = QUESTS.filter((q) => area.quests.includes(q.id));
          const clearedCount = areaQuests.filter((q) => progress.completedQuests.includes(q.id)).length;
          const areaCleared = !locked && areaQuests.length > 0 && clearedCount === areaQuests.length;
          const clearedColor = "#d4a017";

          return (
            <div
              key={areaId}
              style={{
                ...S.panel,
                opacity: locked ? 0.4 : 1,
                border: `1px solid ${areaCleared ? clearedColor : C.border}`,
                boxShadow: areaCleared ? `0 0 8px ${clearedColor}55` : "none",
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
                    <span style={{ color: "#8b1a1a", fontSize: "11px" }}>🔒 Lv{area.minLevel}〜</span>
                  ) : areaCleared ? (
                    <span style={{
                      color: clearedColor,
                      border: `1px solid ${clearedColor}`,
                      fontSize: "11px",
                      padding: "1px 6px",
                      borderRadius: "2px",
                    }}>★ 制圧完了</span>
                  ) : areaQuests.length > 0 ? (
                    <span style={{ color: C.dim, fontSize: "11px" }}>{clearedCount}/{areaQuests.length} 完了</span>
                  ) : (
                    <span style={{ color: C.accent2, fontSize: "11px" }}>Lv{area.minLevel}〜</span>
                  )}
                </div>
              </div>

              {/* クエスト一覧 */}
              {!locked && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {areaQuests.map((q) => {
                    const done = progress.completedQuests.includes(q.id);
                    const levelOk = player.level >= q.minLevel;
                    const canStart = !done && levelOk;

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
                            {progress.activeQuest?.id === q.id && !done && (
                              <span style={{ color: C.accent1, fontSize: "11px", animation: "blink 1.2s step-end infinite" }}>► 進行中</span>
                            )}
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
