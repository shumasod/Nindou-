"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import { C, S, hpBarStyle, chakraBarStyle, barTrackStyle } from "../styles";
import { CLANS, SKILLS, ITEMS } from "../data";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

type SubView = "menu" | "items" | "train" | "skills_list";

export default function HomeScreen({ state, dispatch }: Props) {
  const [subView, setSubView] = useState<SubView>("menu");
  const { player, ui } = state;
  const clanData = player.clan ? CLANS[player.clan] : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "monospace",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* ヘッダー */}
      <div style={{ textAlign: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: "10px" }}>
        <h1 style={{ color: C.accent2, fontSize: "18px", letterSpacing: "0.2em", margin: 0 }}>
          ｜ 影忍伝 ─ 里 ｜
        </h1>
        <p style={{ color: C.dim, fontSize: "11px", margin: "2px 0 0" }}>拠点で次の任務を選べ</p>
      </div>

      {/* Lvアップ通知 */}
      {ui.levelUpPending && (
        <div
          style={{
            background: `${C.accent2}22`,
            border: `1px solid ${C.accent2}`,
            borderRadius: "4px",
            padding: "10px",
            textAlign: "center",
            animation: "fadeIn 0.5s ease",
          }}
        >
          <p style={{ color: C.accent2, fontSize: "16px", margin: 0 }}>⬆ Level Up! Lv.{player.level} ⬆</p>
          <p style={{ color: C.dim, fontSize: "12px", margin: "4px 0 0" }}>
            ステータスポイント +3 獲得！「鍛錬」で割り振れ。
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", flex: 1, flexWrap: "wrap" }}>
        {/* ─── 左パネル: キャラクターステータス ─── */}
        <div style={{ ...S.panel, minWidth: "200px", flex: "0 0 220px" }}>
          {/* 名前・Lv・流派 */}
          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "18px", color: C.text, margin: "0 0 2px", fontWeight: "bold" }}>
              {player.name}
            </p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ color: C.accent2, fontSize: "13px" }}>Lv.{player.level}</span>
              {clanData && (
                <span style={{ color: clanData.color, fontSize: "12px" }}>
                  {clanData.icon} {clanData.name}
                </span>
              )}
            </div>
          </div>

          {/* HP バー */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ ...S.label }}>HP</span>
              <span style={{ color: C.text, fontSize: "12px" }}>{player.hp} / {player.maxHp}</span>
            </div>
            <div style={barTrackStyle}>
              <div style={hpBarStyle(player.hp, player.maxHp)} />
            </div>
          </div>

          {/* チャクラバー */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ ...S.label }}>チャクラ</span>
              <span style={{ color: C.text, fontSize: "12px" }}>{player.chakra} / {player.maxChakra}</span>
            </div>
            <div style={barTrackStyle}>
              <div style={chakraBarStyle(player.chakra, player.maxChakra)} />
            </div>
          </div>

          {/* EXPバー */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ ...S.label }}>EXP</span>
              <span style={{ color: C.text, fontSize: "12px" }}>{player.exp} / {player.expToNext}</span>
            </div>
            <div style={barTrackStyle}>
              <div
                style={{
                  width: `${(player.exp / player.expToNext) * 100}%`,
                  height: "100%",
                  background: C.purple,
                  borderRadius: "2px",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>

          {/* ステータス一覧 */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "10px" }}>
            {([
              ["攻撃力", player.stats.attack, "⚔"],
              ["防御力", player.stats.defense, "🛡"],
              ["素早さ", player.stats.speed, "⚡"],
              ["隠密", player.stats.stealth, "👁"],
            ] as const).map(([label, val, icon]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: C.dim, fontSize: "12px" }}>{icon} {label}</span>
                <span style={{ color: C.text, fontSize: "12px" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* ゴールド */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "10px", marginTop: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.dim, fontSize: "12px" }}>💰 所持金</span>
              <span style={{ color: C.accent2, fontSize: "13px" }}>{player.gold} G</span>
            </div>
          </div>

          {player.statPoints > 0 && (
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <span
                style={{
                  background: C.accent2,
                  color: C.bg,
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "2px",
                  animation: "pulse 1.5s infinite",
                }}
              >
                SP残 {player.statPoints}
              </span>
            </div>
          )}
        </div>

        {/* ─── 右パネル: コンテンツエリア ─── */}
        <div style={{ ...S.panel, flex: 1, minWidth: "240px" }}>
          {subView === "menu" && <MenuView dispatch={dispatch} setSubView={setSubView} />}
          {subView === "items" && <ItemsView player={player} dispatch={dispatch} setSubView={setSubView} />}
          {subView === "train" && <TrainView player={player} dispatch={dispatch} setSubView={setSubView} />}
          {subView === "skills_list" && <SkillsListView player={player} setSubView={setSubView} />}
        </div>
      </div>

      {/* ログエリア */}
      {state.battle.log.length > 0 && (
        <div style={{ ...S.panelSm, fontSize: "12px", color: C.dim, maxHeight: "80px", overflow: "hidden" }}>
          <p style={{ ...S.label, marginBottom: "4px" }}>最後の戦闘ログ</p>
          {state.battle.log.slice(0, 3).map((l, i) => (
            <p key={i} style={{ margin: "2px 0", color: i === 0 ? C.text : C.dim }}>{l}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── メニュービュー ───
function MenuView({
  dispatch,
  setSubView,
}: {
  dispatch: (a: GameAction) => void;
  setSubView: (v: SubView) => void;
}) {
  const btns: { label: string; icon: string; action: () => void; color?: string }[] = [
    { label: "フィールドへ", icon: "🗺", action: () => dispatch({ type: "GO_TO_SCREEN", screen: "map" }), color: C.success },
    { label: "技能", icon: "✨", action: () => setSubView("skills_list") },
    { label: "道具", icon: "🎒", action: () => setSubView("items") },
    { label: "鍛錬", icon: "💪", action: () => setSubView("train") },
  ];

  return (
    <div>
      <h3 style={{ color: C.accent2, margin: "0 0 16px", fontSize: "15px" }}>── 拠点メニュー ──</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {btns.map((b) => (
          <button
            key={b.label}
            style={{ ...S.btn(b.color ?? C.accent1), textAlign: "left", padding: "10px 14px" }}
            onClick={b.action}
            onMouseEnter={(e) => { e.currentTarget.style.background = b.color ?? C.accent1; e.currentTarget.style.color = C.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = b.color ?? C.accent1; }}
          >
            {b.icon}　{b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── アイテムビュー ───
function ItemsView({
  player,
  dispatch,
  setSubView,
}: {
  player: GameState["player"];
  dispatch: (a: GameAction) => void;
  setSubView: (v: SubView) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <button style={{ ...S.btn(C.dim), padding: "4px 10px", fontSize: "12px" }} onClick={() => setSubView("menu")}>
          ← 戻る
        </button>
        <h3 style={{ color: C.accent2, margin: 0, fontSize: "15px" }}>── 所持道具 ──</h3>
      </div>
      {player.items.length === 0 ? (
        <p style={{ color: C.dim, fontSize: "13px" }}>道具を持っていない。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {player.items.map((it) => {
            const item = ITEMS[it.id];
            if (!item) return null;
            const canUse = item.type === "heal" || item.type === "chakra";
            return (
              <div
                key={it.id}
                style={{
                  ...S.panelSm,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px" }}>{item.name}</p>
                    <p style={{ margin: 0, color: C.dim, fontSize: "11px" }}>{item.desc}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: C.accent2, fontSize: "13px" }}>×{it.count}</span>
                  {canUse && (
                    <button
                      style={{ ...S.btn(C.success), padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => dispatch({ type: "PLAYER_ITEM", itemId: it.id })}
                    >
                      使用
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 鍛錬ビュー（ステータス振り分け）───
function TrainView({
  player,
  dispatch,
  setSubView,
}: {
  player: GameState["player"];
  dispatch: (a: GameAction) => void;
  setSubView: (v: SubView) => void;
}) {
  const stats: { key: keyof typeof player.stats; label: string; icon: string }[] = [
    { key: "attack",  label: "攻撃力", icon: "⚔" },
    { key: "defense", label: "防御力", icon: "🛡" },
    { key: "speed",   label: "素早さ", icon: "⚡" },
    { key: "stealth", label: "隠密",   icon: "👁" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <button style={{ ...S.btn(C.dim), padding: "4px 10px", fontSize: "12px" }} onClick={() => setSubView("menu")}>
          ← 戻る
        </button>
        <h3 style={{ color: C.accent2, margin: 0, fontSize: "15px" }}>── 鍛錬 ──</h3>
      </div>
      <p style={{ color: C.dim, fontSize: "13px", marginBottom: "14px" }}>
        残りステータスポイント:{" "}
        <span style={{ color: player.statPoints > 0 ? C.accent2 : C.dim, fontWeight: "bold" }}>
          {player.statPoints}
        </span>
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {stats.map(({ key, label, icon }) => (
          <div
            key={key}
            style={{
              ...S.panelSm,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "14px" }}>
              {icon} {label}: <strong style={{ color: C.text }}>{player.stats[key]}</strong>
            </span>
            <button
              style={
                player.statPoints > 0
                  ? { ...S.btn(C.accent2), padding: "4px 12px", fontSize: "13px" }
                  : { ...S.btnDisabled, padding: "4px 12px", fontSize: "13px" }
              }
              disabled={player.statPoints <= 0}
              onClick={() => dispatch({ type: "ALLOCATE_STAT", stat: key })}
            >
              + 振る
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── スキル一覧ビュー ───
function SkillsListView({
  player,
  setSubView,
}: {
  player: GameState["player"];
  setSubView: (v: SubView) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <button style={{ ...S.btn(C.dim), padding: "4px 10px", fontSize: "12px" }} onClick={() => setSubView("menu")}>
          ← 戻る
        </button>
        <h3 style={{ color: C.accent2, margin: 0, fontSize: "15px" }}>── 習得技能 ──</h3>
      </div>
      {player.skills.length === 0 ? (
        <p style={{ color: C.dim, fontSize: "13px" }}>まだ技能を習得していない。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {player.skills.map((skillId) => {
            const skill = SKILLS[skillId];
            if (!skill) return null;
            return (
              <div key={skillId} style={{ ...S.panelSm }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: C.text, fontSize: "14px", fontWeight: "bold" }}>{skill.name}</span>
                  <span style={{ color: C.chakra, fontSize: "12px" }}>⚡{skill.cost}</span>
                </div>
                <p style={{ color: C.dim, fontSize: "12px", margin: 0 }}>{skill.desc}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
