import type { CSSProperties } from "react";

// ===== カラーパレット =====
export const C = {
  bg:       "#0a0a0f",
  text:     "#e8d5b7",
  panel:    "#12121a",
  border:   "#2a2a3a",
  accent1:  "#c41e1e",  // 血赤
  accent2:  "#d4a017",  // 金
  success:  "#4a9e5c",  // 深緑
  danger:   "#8b1a1a",  // 暗赤
  purple:   "#7a4bb5",
  chakra:   "#3a6ea8",  // 青
  dim:      "#555566",
} as const;

// ===== 共通スタイル =====
export const S = {
  panel: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: "4px",
    padding: "16px",
  } as CSSProperties,

  panelSm: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: "4px",
    padding: "10px 12px",
  } as CSSProperties,

  btn: (color = C.accent1): CSSProperties => ({
    background: "transparent",
    border: `1px solid ${color}`,
    color: color,
    padding: "8px 16px",
    cursor: "pointer",
    fontFamily: "monospace",
    fontSize: "14px",
    borderRadius: "2px",
    transition: "all 0.2s",
  }),

  btnDisabled: {
    background: "transparent",
    border: `1px solid ${C.dim}`,
    color: C.dim,
    padding: "8px 16px",
    cursor: "not-allowed",
    fontFamily: "monospace",
    fontSize: "14px",
    borderRadius: "2px",
  } as CSSProperties,

  input: {
    background: "#1a1a28",
    border: `1px solid ${C.border}`,
    color: C.text,
    padding: "8px 12px",
    fontFamily: "monospace",
    fontSize: "16px",
    borderRadius: "2px",
    outline: "none",
    width: "100%",
  } as CSSProperties,

  title: {
    color: C.accent2,
    fontFamily: "monospace",
    letterSpacing: "0.15em",
  } as CSSProperties,

  label: {
    color: C.dim,
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  } as CSSProperties,
} as const;

// ===== HPバースタイル =====
export function hpBarStyle(current: number, max: number): CSSProperties {
  const ratio = current / max;
  const color = ratio > 0.5 ? C.success : ratio > 0.25 ? C.accent2 : C.accent1;
  return {
    width: `${Math.max(0, ratio * 100)}%`,
    height: "100%",
    background: color,
    transition: "width 0.3s, background 0.3s",
    borderRadius: "2px",
  };
}

export function chakraBarStyle(current: number, max: number): CSSProperties {
  return {
    width: `${Math.max(0, (current / max) * 100)}%`,
    height: "100%",
    background: C.chakra,
    transition: "width 0.3s",
    borderRadius: "2px",
  };
}

export const barTrackStyle: CSSProperties = {
  width: "100%",
  height: "8px",
  background: "#1a1a28",
  borderRadius: "2px",
  overflow: "hidden",
};

// ===== キーフレームCSS =====
export const KEYFRAMES_CSS = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(196,30,30,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(196,30,30,0); }
}
@keyframes dangerPulse {
  0%, 100% { box-shadow: inset 0 0 30px rgba(196,30,30,0.1); }
  50%       { box-shadow: inset 0 0 30px rgba(196,30,30,0.4); }
}
@keyframes levelUp {
  0%   { opacity: 0; transform: scale(0.8) translateY(10px); }
  50%  { opacity: 1; transform: scale(1.1) translateY(-5px); }
  100% { opacity: 0; transform: scale(1)   translateY(-20px); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes critical {
  0%   { transform: scale(1);   color: #c41e1e; }
  50%  { transform: scale(1.3); color: #ff4444; }
  100% { transform: scale(1);   color: #c41e1e; }
}
`;
