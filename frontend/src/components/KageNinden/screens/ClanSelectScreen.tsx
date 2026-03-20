"use client";
import { useState } from "react";
import { C, S } from "../styles";
import { CLANS } from "../data";
import type { ClanId } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  dispatch: (a: GameAction) => void;
}

export default function ClanSelectScreen({ dispatch }: Props) {
  const [selected, setSelected] = useState<ClanId | null>(null);

  const clans = Object.entries(CLANS) as [ClanId, (typeof CLANS)[keyof typeof CLANS]][];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "monospace",
        padding: "40px 20px",
      }}
    >
      <div style={{ animation: "fadeIn 0.8s ease", width: "100%", maxWidth: "720px" }}>
        <p style={S.label}>STEP 1 / 2</p>
        <h2 style={{ ...S.title, fontSize: "22px", margin: "8px 0 4px" }}>｜ 流派を選べ ｜</h2>
        <p style={{ color: C.dim, fontSize: "13px", marginBottom: "32px" }}>
          流派はあなたの戦闘スタイルと初期スキルを決定する。
        </p>

        {/* 流派カード */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {clans.map(([id, clan]) => {
            const isSelected = selected === id;
            return (
              <div
                key={id}
                onClick={() => setSelected(id)}
                style={{
                  ...S.panel,
                  border: `2px solid ${isSelected ? clan.color : C.border}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: isSelected ? `${clan.color}18` : C.panel,
                  transform: isSelected ? "translateY(-4px)" : "none",
                  boxShadow: isSelected ? `0 4px 20px ${clan.color}40` : "none",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{clan.icon}</div>
                <h3 style={{ color: clan.color, fontSize: "18px", margin: "0 0 6px", letterSpacing: "0.1em" }}>
                  {clan.name}
                </h3>
                <p style={{ color: C.dim, fontSize: "12px", lineHeight: 1.6, marginBottom: "12px" }}>
                  {clan.desc}
                </p>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "10px" }}>
                  <p style={{ ...S.label, marginBottom: "4px" }}>ボーナスステータス</p>
                  {Object.entries(clan.bonus).map(([k, v]) => (
                    <p key={k} style={{ color: C.success, fontSize: "12px", margin: "2px 0" }}>
                      {statLabel(k)} +{v}
                    </p>
                  ))}
                  <p style={{ ...S.label, marginTop: "8px", marginBottom: "4px" }}>初期スキル</p>
                  <p style={{ color: clan.color, fontSize: "12px" }}>
                    {getStarterSkillName(clan.starterSkill)}
                  </p>
                </div>
                {isSelected && (
                  <div
                    style={{
                      marginTop: "10px",
                      textAlign: "center",
                      color: clan.color,
                      fontSize: "12px",
                      animation: "fadeIn 0.3s ease",
                    }}
                  >
                    ✓ 選択中
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 確定ボタン */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            style={
              selected
                ? { ...S.btn(C.accent2), padding: "12px 40px", fontSize: "15px" }
                : { ...S.btnDisabled, padding: "12px 40px", fontSize: "15px" }
            }
            disabled={!selected}
            onClick={() => selected && dispatch({ type: "SELECT_CLAN", clan: selected })}
          >
            {selected ? `${CLANS[selected].name}で旅立つ ▶` : "流派を選択してください"}
          </button>
        </div>
      </div>
    </div>
  );
}

function statLabel(key: string): string {
  const map: Record<string, string> = {
    maxHp: "最大HP",
    maxChakra: "最大チャクラ",
    attack: "攻撃力",
    defense: "防御力",
    speed: "素早さ",
    stealth: "隠密",
  };
  return map[key] ?? key;
}

function getStarterSkillName(skillId: string): string {
  const map: Record<string, string> = {
    spin_slash:    "螺旋斬り",
    phantom_clone: "幻影分身",
    flash_step:    "瞬身の術",
  };
  return map[skillId] ?? skillId;
}
