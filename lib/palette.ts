// Hex values mirror the CSS tokens in globals.css; Recharts and three.js need literal colours.
// On the dark ground the scale runs bright = strong.
export const water = {
  900: "#e8f8ff",
  700: "#8fdcf2",
  600: "#5cc7e0",
  500: "#2fa6c4",
  400: "#1f7f9c",
  300: "#1d5a73",
  200: "#16394a",
  100: "#0f2430",
} as const;

export const silt = "#e0b779";
export const stone = "#3b4a54";
export const ink = "#dfeaf0";
export const muted = "#7f95a3";
export const grid = "rgba(170, 215, 235, 0.08)";
export const danger = "#f08a7e";

/** Ordered series palette, bright to deep, with a neutral last slot for "other". */
export const series = [water[900], water[700], water[600], water[500], water[400], stone];
