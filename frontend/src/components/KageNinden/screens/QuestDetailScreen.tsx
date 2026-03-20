"use client";
import { C, S } from "../styles";
import { ENEMIES, ITEMS } from "../data";
import { rankColor } from "../utils";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

export default function QuestDetailScreen({ state, dispatch }: Props) {
  const quest = state.progress.activeQuest;
  if (!quest) {
    dispatch({ type: "GO_TO_SCREEN", screen: "map" });
    return null;
  }

  const enemy = ENEMIES[quest.target];
  const progress = state.progress.questProgress[quest.id] ?? 0;

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
          onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "map" })}
        >
          ← 戻る
        </button>
        <h2 style={{ color: C.accent2, margin: 0, fontSize: "18px", letterSpacing: "0.15em" }}>
          ｜ 任務詳細 ｜
        </h2>
      </div>

      <div style={{ maxWidth: "600px" }}>
        {/* クエストタイトル */}
        <div style={{ ...S.panel, marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
            <span
              style={{
                color: rankColor(quest.rank),
                border: `1px solid ${rankColor(quest.rank)}`,
                padding: "2px 8px",
                fontSize: "13px",
                borderRadius: "2px",
              }}
            >
              {quest.rank}ランク
            </span>
            <h3 style={{ margin: 0, color: C.text, fontSize: "18px" }}>{quest.title}</h3>
          </div>
          <p style={{ color: C.dim, fontSize: "13px", lineHeight: 1.7 }}>{quest.desc}</p>
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${C.border}` }}>
            <p style={{ color: C.dim, fontSize: "12px", margin: "0 0 4px" }}>
              目標: <span style={{ color: C.text }}>{enemy?.name ?? quest.target}</span> を{quest.count}体倒す
            </p>
            <p style={{ color: C.dim, fontSize: "12px", margin: 0 }}>
              進捗: <span style={{ color: C.accent2 }}>{progress} / {quest.count}</span>
            </p>
          </div>
        </div>

        {/* 敵情報 */}
        {enemy && (
          <div style={{ ...S.panel, marginBottom: "16px" }}>
            <p style={{ ...S.label, marginBottom: "8px" }}>出現する敵</p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "32px" }}>{enemy.icon}</span>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "16px", color: C.text }}>{enemy.name}</p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ color: C.dim, fontSize: "12px" }}>HP: {enemy.hp}</span>
                  <span style={{ color: C.dim, fontSize: "12px" }}>攻撃: {enemy.attack}</span>
                  <span style={{ color: C.dim, fontSize: "12px" }}>防御: {enemy.defense}</span>
                  <span style={{ color: C.dim, fontSize: "12px" }}>速さ: {enemy.speed}</span>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <span style={{ color: C.accent2, fontSize: "12px" }}>EXP: {enemy.exp}</span>
                  <span style={{ color: C.accent2, fontSize: "12px" }}>G: {enemy.gold}</span>
                </div>
                {enemy.drops.length > 0 && (
                  <p style={{ color: C.dim, fontSize: "11px", marginTop: "4px" }}>
                    ドロップ: {enemy.drops.map(d => `${ITEMS[d.id]?.name ?? d.id}(${Math.round(d.rate * 100)}%)`).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 報酬 */}
        <div style={{ ...S.panel, marginBottom: "24px" }}>
          <p style={{ ...S.label, marginBottom: "8px" }}>任務完了報酬</p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ color: C.accent2, fontSize: "14px" }}>EXP +{quest.reward.exp}</span>
            <span style={{ color: C.accent2, fontSize: "14px" }}>G +{quest.reward.gold}</span>
            {quest.reward.items.map((ri, i) => (
              <span key={i} style={{ color: C.success, fontSize: "14px" }}>
                {ITEMS[ri.id]?.icon} {ITEMS[ri.id]?.name} ×{ri.count ?? 1}
              </span>
            ))}
          </div>
        </div>

        {/* 出陣ボタン */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            style={{ ...S.btn(C.dim), padding: "10px 20px" }}
            onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "map" })}
          >
            任務を断る
          </button>
          <button
            style={{ ...S.btn(C.accent1), padding: "10px 24px", fontSize: "15px" }}
            onClick={() => dispatch({ type: "START_BATTLE", enemyId: quest.target, questId: quest.id })}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.accent1; e.currentTarget.style.color = C.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.accent1; }}
          >
            ⚔ 出陣！
          </button>
        </div>
      </div>
    </div>
  );
}
