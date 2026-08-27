"use client";
import { C, S } from "../styles";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

export default function GameOverScreen({ state, dispatch }: Props) {
  const { player, battle } = state;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        color: C.text,
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "420px", width: "100%", textAlign: "center", animation: "fadeIn 1s ease" }}>
        {/* ゲームオーバータイトル */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: C.danger, fontSize: "13px", letterSpacing: "0.3em", margin: "0 0 8px" }}>
            ── GAME OVER ──
          </p>
          <p style={{ color: C.accent1, fontSize: "32px", margin: "0 0 16px", letterSpacing: "0.15em" }}>
            力尽きた...
          </p>
          <p style={{ color: C.dim, fontSize: "14px", lineHeight: 1.8 }}>
            {player.name}は倒れた。<br />
            しかし、忍の魂は消えない。
          </p>
        </div>

        {/* 最後の戦闘情報 */}
        {battle.enemy && (
          <div style={{ ...S.panel, marginBottom: "24px", border: `1px solid ${C.danger}40` }}>
            <p style={{ ...S.label, marginBottom: "8px" }}>最後の戦い</p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "28px" }}>{battle.enemy.icon}</span>
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: 0, color: C.accent1, fontSize: "15px" }}>{battle.enemy.name}</p>
                <p style={{ margin: "2px 0 0", color: C.dim, fontSize: "12px" }}>
                  Turn {battle.turn} で討死
                </p>
                <p style={{ margin: "2px 0 0", color: C.dim, fontSize: "11px" }}>
                  残HP: {battle.enemy.hp} / {battle.enemy.maxHp}
                  （あと <span style={{ color: C.accent2 }}>{battle.enemy.hp}</span> で撃破）
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 最終ステータス */}
        <div style={{ ...S.panel, marginBottom: "32px" }}>
          <p style={{ ...S.label, marginBottom: "8px" }}>最終記録</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { label: "名前",   val: player.name,              color: C.text },
              { label: "レベル", val: `Lv.${player.level}`,     color: C.text },
              { label: "経験値", val: `${player.exp} EXP`,      color: C.purple },
              { label: "所持金", val: `${player.gold} G`,       color: C.accent2 },
              { label: "クラン", val: player.clan ?? "─",       color: C.dim },
              { label: "討伐数", val: `${battle.killCount}体`,   color: C.success },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.dim, fontSize: "13px" }}>{label}</span>
                <span style={{ color, fontSize: "13px" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ラストログ */}
        {battle.log.length > 0 && (
          <div style={{ ...S.panelSm, marginBottom: "24px", textAlign: "left" }}>
            <p style={{ ...S.label, marginBottom: "6px" }}>最後の記録</p>
            {battle.log.slice(0, 4).map((l, i) => (
              <p key={i} style={{ margin: "2px 0", fontSize: "11px", color: i === 0 ? C.text : C.dim }}>
                {l}
              </p>
            ))}
          </div>
        )}

        {/* リスタートボタン */}
        <button
          style={{ ...S.btn(C.accent1), padding: "12px 40px", fontSize: "15px", width: "100%" }}
          onClick={() => dispatch({ type: "RESET_GAME" })}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.accent1; e.currentTarget.style.color = C.bg; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.accent1; }}
        >
          ▶ 再び立ち上がる
        </button>
      </div>
    </div>
  );
}
