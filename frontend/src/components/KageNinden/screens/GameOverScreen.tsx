"use client";
import { C, S, hpBarStyle, barTrackStyle } from "../styles";
import { CLANS } from "../data";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

function retryTip(level: number, completedCount: number): string {
  if (level <= 2) return "まず鍛錬でステータスを上げ、装備を整えよ。";
  if (completedCount === 0) return "最初の任務から着実に経験を積め。焦りは禁物だ。";
  if (level <= 5) return "流派スキルを活用し、チャクラ管理を意識しろ。";
  return "敵のAIパターンを読み、防御と回復を惜しむな。";
}

export default function GameOverScreen({ state, dispatch }: Props) {
  const { player, battle, progress } = state;
  const completedCount = progress.completedQuests.length;
  const clanData = player.clan ? CLANS[player.clan] : null;

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
          <div style={{ ...S.panel, marginBottom: "16px" }}>
            <p style={{ ...S.label, marginBottom: "8px" }}>最後の戦い</p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "28px" }}>{battle.enemy.icon}</span>
              <div style={{ textAlign: "left", flex: 1 }}>
                <p style={{ margin: 0, color: C.accent1, fontSize: "15px" }}>{battle.enemy.name}</p>
                <p style={{ margin: "2px 0 0", color: C.dim, fontSize: "12px" }}>
                  Turn {battle.turn} で討死
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, color: C.dim, fontSize: "11px" }}>残りHP</p>
                <p style={{ margin: 0, color: C.accent1, fontSize: "13px" }}>
                  {battle.enemy.hp} / {battle.enemy.maxHp}
                </p>
              </div>
            </div>
            {/* 敵残HP バー */}
            <div style={barTrackStyle}>
              <div style={hpBarStyle(battle.enemy.hp, battle.enemy.maxHp)} />
            </div>
          </div>
        )}

        {/* 最終ステータス */}
        <div style={{ ...S.panel, marginBottom: "16px" }}>
          <p style={{ ...S.label, marginBottom: "8px" }}>最終記録</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {([
              ["名前", player.name, C.text],
              ["流派", clanData ? `${clanData.icon} ${clanData.name}` : "未選択", clanData?.color ?? C.dim],
              ["レベル", `Lv.${player.level}`, C.accent2],
              ["経験値", `${player.exp} EXP`, C.text],
              ["所持金", `${player.gold} G`, C.accent2],
              ["完了任務", `${completedCount} 件`, completedCount > 0 ? C.success : C.dim],
            ] as const).map(([label, val, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.dim, fontSize: "13px" }}>{label}</span>
                <span style={{ color, fontSize: "13px" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 次回へのアドバイス */}
        <div
          style={{
            ...S.panelSm,
            marginBottom: "16px",
            border: `1px solid ${C.accent2}44`,
            background: `${C.accent2}08`,
            textAlign: "left",
          }}
        >
          <p style={{ ...S.label, marginBottom: "4px" }}>忍の言葉</p>
          <p style={{ color: C.text, fontSize: "12px", margin: 0, lineHeight: 1.6 }}>
            {retryTip(player.level, completedCount)}
          </p>
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
