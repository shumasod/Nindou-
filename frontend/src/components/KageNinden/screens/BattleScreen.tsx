"use client";
import { useEffect, useState, useRef } from "react";
import type { CSSProperties } from "react";
import { C, S, hpBarStyle, chakraBarStyle, barTrackStyle } from "../styles";
import { SKILLS, ITEMS } from "../data";
import type { GameState, StatusEffect } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

export default function BattleScreen({ state, dispatch }: Props) {
  const { player, battle } = state;
  const { enemy, log, playerStatus, enemyStatus, phase, turn } = battle;
  const [showSkills, setShowSkills] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [critFlash, setCritFlash] = useState(false);
  const [ambushBanner, setAmbushBanner] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // 奇襲バナー表示
  useEffect(() => {
    if (log[log.length - 1]?.includes("奇襲成功")) {
      setAmbushBanner(true);
      setTimeout(() => setAmbushBanner(false), 2000);
    }
  }, [battle.turn === 1]);

  // 敵ターン自動実行
  useEffect(() => {
    if (phase === "enemy") {
      const timer = setTimeout(() => {
        dispatch({ type: "ENEMY_TURN" });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, dispatch]);

  // CRITICAL検知
  useEffect(() => {
    if (log[0]?.includes("CRITICAL")) {
      setCritFlash(true);
      setTimeout(() => setCritFlash(false), 800);
    }
  }, [log[0]]);

  const isAnimating = phase === "enemy";
  const isPlayerTurn = phase === "player";
  const hpRatio = player.hp / player.maxHp;
  const isDanger = hpRatio <= 0.25;

  if (!enemy) return null;

  const playerItems = player.items.filter((it) => ITEMS[it.id]);
  const playerSkills = player.skills.filter((sid) => SKILLS[sid]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "monospace",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        // HP低下で画面枠チカチカ
        animation: isDanger ? "dangerPulse 1.2s infinite" : "none",
        boxSizing: "border-box",
      }}
    >
      {/* 奇襲バナー */}
      {ambushBanner && (
        <div style={ambushBannerStyle}>
          ⚡ 奇襲成功！先手を取った！ ⚡
        </div>
      )}

      {/* ターン数 */}
      <div style={{ textAlign: "right" }}>
        <span style={{ color: C.dim, fontSize: "11px" }}>Turn {turn}</span>
      </div>

      {/* ─── 敵情報 ─── */}
      <div style={{ ...S.panel }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "32px" }}>{enemy.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: "16px", color: C.accent1 }}>{enemy.name}</p>
              {enemy.phase2 && (
                <span style={{ color: C.accent2, fontSize: "11px", animation: "pulse 1s infinite" }}>
                  【フェーズ2】
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, color: C.text, fontSize: "13px" }}>{enemy.hp} / {enemy.maxHp}</p>
          </div>
        </div>
        {/* 敵HPバー */}
        <div style={barTrackStyle}>
          <div style={hpBarStyle(enemy.hp, enemy.maxHp)} />
        </div>
        {/* 敵状態異常 */}
        {enemyStatus.length > 0 && (
          <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
            {enemyStatus.map((e, i) => (
              <StatusBadge key={i} effect={e} />
            ))}
          </div>
        )}
      </div>

      {/* ─── VS 演出 ─── */}
      <div style={{ textAlign: "center", padding: "4px 0" }}>
        {isAnimating ? (
          <p style={{ color: C.dim, fontSize: "13px", animation: "blink 0.8s infinite" }}>
            ── 敵の行動 ──
          </p>
        ) : (
          <p style={{ color: C.accent2, fontSize: "13px" }}>── あなたの番 ──</p>
        )}
        {critFlash && (
          <p style={{ color: C.accent1, fontSize: "18px", fontWeight: "bold", animation: "critical 0.8s ease" }}>
            CRITICAL!!
          </p>
        )}
      </div>

      {/* ─── プレイヤー情報 ─── */}
      <div style={{ ...S.panel }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <p style={{ margin: 0, fontSize: "15px" }}>{player.name}</p>
          <p style={{ margin: 0, fontSize: "13px", color: C.text }}>{player.hp} / {player.maxHp}</p>
        </div>
        {/* HP */}
        <div style={{ marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <span style={{ ...S.label }}>HP</span>
          </div>
          <div style={barTrackStyle}><div style={hpBarStyle(player.hp, player.maxHp)} /></div>
        </div>
        {/* チャクラ */}
        <div style={{ marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <span style={{ ...S.label }}>チャクラ</span>
            <span style={{ color: C.chakra, fontSize: "11px" }}>{player.chakra}/{player.maxChakra}</span>
          </div>
          <div style={barTrackStyle}><div style={chakraBarStyle(player.chakra, player.maxChakra)} /></div>
        </div>
        {/* プレイヤー状態異常 */}
        {playerStatus.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {playerStatus.map((e, i) => (
              <StatusBadge key={i} effect={e} />
            ))}
          </div>
        )}
      </div>

      {/* ─── 行動選択 ─── */}
      <div style={{ ...S.panel }}>
        {showSkills ? (
          <SkillPanel
            player={player}
            skills={playerSkills}
            isAnimating={isAnimating}
            dispatch={dispatch}
            onClose={() => setShowSkills(false)}
          />
        ) : showItems ? (
          <ItemPanel
            player={player}
            items={playerItems}
            isAnimating={isAnimating}
            dispatch={dispatch}
            onClose={() => setShowItems(false)}
          />
        ) : (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <ActionBtn
              label="⚔ 攻撃"
              color={C.accent1}
              disabled={isAnimating}
              onClick={() => dispatch({ type: "PLAYER_ATTACK" })}
            />
            <ActionBtn
              label={`✨ 術${playerSkills.length > 0 ? `(${playerSkills.length})` : ""}`}
              color={C.purple}
              disabled={isAnimating || playerSkills.length === 0}
              onClick={() => { setShowSkills(true); setShowItems(false); }}
            />
            <ActionBtn
              label={`🎒 道具${playerItems.length > 0 ? `(${playerItems.length})` : ""}`}
              color={C.success}
              disabled={isAnimating || playerItems.length === 0}
              onClick={() => { setShowItems(true); setShowSkills(false); }}
            />
            <ActionBtn
              label="🛡 防御"
              color={C.chakra}
              disabled={isAnimating}
              onClick={() => dispatch({ type: "PLAYER_DEFEND" })}
            />
            <ActionBtn
              label="💨 逃走"
              color={C.dim}
              disabled={isAnimating}
              onClick={() => dispatch({ type: "PLAYER_ESCAPE" })}
            />
          </div>
        )}
      </div>

      {/* ─── 戦闘ログ ─── */}
      <div ref={logRef} style={{ ...S.panel, maxHeight: "160px", overflowY: "auto" }}>
        <p style={{ ...S.label, marginBottom: "6px" }}>戦闘ログ</p>
        {log.map((line, i) => (
          <p
            key={i}
            style={{
              margin: "2px 0",
              fontSize: "12px",
              color: logColor(line, i),
              animation: i === 0 ? "fadeIn 0.3s ease" : "none",
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── アクションボタン ───
function ActionBtn({
  label, color, disabled, onClick,
}: {
  label: string; color: string; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      style={disabled ? { ...S.btnDisabled, padding: "8px 12px", fontSize: "13px" } : { ...S.btn(color), padding: "8px 12px", fontSize: "13px" }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = color; e.currentTarget.style.color = C.bg; } }}
      onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = color; } }}
    >
      {label}
    </button>
  );
}

// ─── スキルパネル ───
function SkillPanel({
  player, skills, isAnimating, dispatch, onClose,
}: {
  player: GameState["player"];
  skills: string[];
  isAnimating: boolean;
  dispatch: (a: GameAction) => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ color: C.accent2, fontSize: "13px" }}>── 術を選べ ──</span>
        <button style={{ ...S.btn(C.dim), padding: "2px 8px", fontSize: "12px" }} onClick={onClose}>✕</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {skills.map((sid) => {
          const sk = SKILLS[sid];
          if (!sk) return null;
          const canUse = player.chakra >= sk.cost && !isAnimating;
          return (
            <button
              key={sid}
              style={
                canUse
                  ? { ...S.btn(C.purple), textAlign: "left", padding: "6px 10px", width: "100%" }
                  : { ...S.btnDisabled, textAlign: "left", padding: "6px 10px", width: "100%" }
              }
              disabled={!canUse}
              onClick={() => { dispatch({ type: "PLAYER_SKILL", skillId: sid }); onClose(); }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{sk.name}</span>
                <span style={{ color: canUse ? C.chakra : C.dim, fontSize: "12px" }}>⚡{sk.cost}</span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: C.dim }}>{sk.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── アイテムパネル ───
function ItemPanel({
  player, items, isAnimating, dispatch, onClose,
}: {
  player: GameState["player"];
  items: GameState["player"]["items"];
  isAnimating: boolean;
  dispatch: (a: GameAction) => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ color: C.accent2, fontSize: "13px" }}>── 道具を使う ──</span>
        <button style={{ ...S.btn(C.dim), padding: "2px 8px", fontSize: "12px" }} onClick={onClose}>✕</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((it) => {
          const item = ITEMS[it.id];
          if (!item) return null;
          return (
            <button
              key={it.id}
              style={
                !isAnimating
                  ? { ...S.btn(C.success), textAlign: "left", padding: "6px 10px", width: "100%" }
                  : { ...S.btnDisabled, textAlign: "left", padding: "6px 10px", width: "100%" }
              }
              disabled={isAnimating}
              onClick={() => { dispatch({ type: "PLAYER_ITEM", itemId: it.id }); onClose(); }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{item.icon} {item.name}</span>
                <span style={{ color: C.accent2, fontSize: "12px" }}>×{it.count}</span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: C.dim }}>{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 状態異常バッジ ───
function StatusBadge({ effect }: { effect: StatusEffect }) {
  const colorMap: Record<string, string> = {
    poison: "#8b6914",
    stun: "#3a6ea8",
    confusion: C.purple,
    defending: C.chakra,
    defense_up: C.chakra,
    speed_up: C.success,
    shadow_clone: C.purple,
  };
  const color = colorMap[effect.id] ?? C.dim;
  return (
    <span
      style={{
        border: `1px solid ${color}`,
        color: color,
        fontSize: "10px",
        padding: "1px 6px",
        borderRadius: "2px",
      }}
    >
      {effect.name} ({effect.turns}T)
    </span>
  );
}

// ─── ログの色分け ───
function logColor(line: string, index: number): string {
  if (index > 0) return C.dim;
  if (line.includes("CRITICAL")) return C.accent1;
  if (line.includes("倒した")) return C.success;
  if (line.includes("奇襲")) return C.accent2;
  if (line.includes("フェーズ")) return C.accent1;
  if (line.includes("ダメージ") && line.includes(line.split("の")[0])) return C.text;
  return C.text;
}

// ─── スタイル ───
const ambushBannerStyle: CSSProperties = {
  position: "fixed",
  top: "20%",
  left: "50%",
  transform: "translateX(-50%)",
  background: C.accent2,
  color: C.bg,
  padding: "10px 24px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "4px",
  zIndex: 999,
  animation: "fadeIn 0.3s ease",
  whiteSpace: "nowrap",
};
