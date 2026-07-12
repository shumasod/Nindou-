"use client";
import { useState } from "react";
import { C, S } from "../styles";
import { ITEMS, WEAPONS, ARMORS, SHOP_CATALOG } from "../data";
import type { ShopCategory } from "../data";
import type { GameState } from "../types";
import type { GameAction } from "../reducer";

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

export default function ShopScreen({ state, dispatch }: Props) {
  const { player } = state;
  const [tab, setTab] = useState<ShopCategory>("item");
  const [flash, setFlash] = useState<string | null>(null);

  function buy(entry: typeof SHOP_CATALOG[number]) {
    if (player.gold < entry.price) return;
    if (entry.category === "item") {
      dispatch({ type: "BUY_ITEM", itemId: entry.id, price: entry.price });
    } else {
      dispatch({ type: "BUY_EQUIP", equipType: entry.category as "weapon" | "armor", equipId: entry.id, price: entry.price });
    }
    setFlash(entry.id);
    setTimeout(() => setFlash(null), 800);
  }

  const catalog = SHOP_CATALOG.filter(
    (e) => e.category === tab && (!e.minLevel || player.level >= e.minLevel)
  );

  const tabs: { key: ShopCategory; label: string; icon: string }[] = [
    { key: "item",   label: "道具",  icon: "🎒" },
    { key: "weapon", label: "武器",  icon: "⚔️" },
    { key: "armor",  label: "防具",  icon: "🛡" },
  ];

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: "12px",
        }}
      >
        <button
          style={{ ...S.btn(C.dim), padding: "6px 12px", fontSize: "12px" }}
          onClick={() => dispatch({ type: "GO_TO_SCREEN", screen: "home" })}
        >
          ← 里へ
        </button>
        <h2 style={{ color: C.accent2, margin: 0, fontSize: "18px", letterSpacing: "0.15em" }}>
          ｜ 里の商店 ｜
        </h2>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: C.dim, fontSize: "12px" }}>所持金:</span>
          <span style={{ color: C.accent2, fontSize: "15px", fontWeight: "bold" }}>{player.gold} G</span>
        </div>
      </div>

      <p style={{ color: C.dim, fontSize: "12px", marginBottom: "14px" }}>
        里の商人が道具・装備を売っている。任務の前にしっかり準備しろ。
      </p>

      {/* タブ */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            style={
              tab === t.key
                ? { ...S.btn(C.accent2), padding: "6px 16px", fontSize: "13px", background: C.accent2, color: C.bg }
                : { ...S.btn(C.dim), padding: "6px 16px", fontSize: "13px" }
            }
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 商品一覧 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {catalog.length === 0 ? (
          <p style={{ color: C.dim, fontSize: "13px" }}>この品揃えにはレベルが足りない。</p>
        ) : (
          catalog.map((entry) => {
            const canAfford = player.gold >= entry.price;
            const isEquipped =
              (entry.category === "weapon" && player.equip.weapon === entry.id) ||
              (entry.category === "armor"  && player.equip.armor  === entry.id);
            const isFlashing = flash === entry.id;

            const itemData = entry.category === "item"   ? ITEMS[entry.id]   : null;
            const weapData = entry.category === "weapon" ? WEAPONS[entry.id] : null;
            const armData  = entry.category === "armor"  ? ARMORS[entry.id]  : null;
            const name = itemData?.name ?? weapData?.name ?? armData?.name ?? entry.id;
            const icon = itemData?.icon ?? (entry.category === "weapon" ? "⚔️" : "🛡");
            const desc = itemData?.desc ?? weapData?.desc ?? armData?.desc ?? "";
            const bonus = weapData
              ? [weapData.attack !== 0 && `ATK${weapData.attack > 0 ? "+" : ""}${weapData.attack}`, weapData.speed !== 0 && `SPD${weapData.speed > 0 ? "+" : ""}${weapData.speed}`].filter(Boolean).join("  ")
              : armData
              ? [armData.defense !== 0 && `DEF${armData.defense > 0 ? "+" : ""}${armData.defense}`, armData.stealth !== 0 && `STL${armData.stealth > 0 ? "+" : ""}${armData.stealth}`].filter(Boolean).join("  ")
              : null;

            return (
              <div
                key={entry.id}
                style={{
                  ...S.panel,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  animation: isFlashing ? "fadeIn 0.4s ease" : "none",
                  border: `1px solid ${isEquipped ? C.success + "88" : C.border}`,
                  background: isEquipped ? `${C.success}0a` : undefined,
                }}
              >
                <span style={{ fontSize: "26px" }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ color: C.text, fontSize: "14px" }}>{name}</span>
                    {isEquipped && (
                      <span style={{ color: C.success, fontSize: "10px", border: `1px solid ${C.success}`, padding: "0 4px", borderRadius: "2px" }}>
                        装備中
                      </span>
                    )}
                    {bonus && (
                      <span style={{ color: C.chakra, fontSize: "11px" }}>{bonus}</span>
                    )}
                  </div>
                  <p style={{ margin: 0, color: C.dim, fontSize: "11px" }}>{desc}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ color: canAfford ? C.accent2 : C.dim, fontSize: "14px", fontWeight: "bold" }}>
                    {entry.price} G
                  </span>
                  <button
                    style={
                      canAfford && !isEquipped
                        ? { ...S.btn(C.accent2), padding: "4px 12px", fontSize: "12px" }
                        : { ...S.btnDisabled, padding: "4px 12px", fontSize: "12px" }
                    }
                    disabled={!canAfford || isEquipped}
                    onClick={() => buy(entry)}
                    onMouseEnter={(e) => { if (canAfford && !isEquipped) { e.currentTarget.style.background = C.accent2; e.currentTarget.style.color = C.bg; } }}
                    onMouseLeave={(e) => { if (canAfford && !isEquipped) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.accent2; } }}
                  >
                    {isEquipped ? "装備中" : canAfford ? "購入" : "G不足"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
