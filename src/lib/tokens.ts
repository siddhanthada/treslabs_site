/**
 * Brand colour values for places where JS animates colour directly
 * (GSAP/SVG). Keep in sync with the @theme block in app/globals.css.
 */
export const color = {
  bone: "#f6f6f3",
  paper: "#ffffff",
  sink: "#ecece7",
  ink: "#111218",
  ink2: "#4c4f5a",
  ink3: "#8a8c96",
  line: "#e3e3dd",
  line2: "#cdcdc5",
  carbon: "#111214",
  carbon2: "#1b1c1f",
  carbonLine: "#2c2e33",
  onCarbon: "#f1f0ec",
  onCarbon2: "#a6a7ab",
  onCarbon3: "#6f7176",
  signal: "#3a3af0",
  signalLit: "#8c8cff",
  signalTint: "#dfdffc",
  fault: "#c2502e",
  faultLit: "#e0714f",
  faultTint: "#f4ddd3",
  daylight: "#f5e4c3",
  daylight2: "#fbf1dd",
  amber: "#e9ab55",
  umber: "#6b4a1f",
  haze: "#c9cbff",
  lime: "#d7f36a",
  limeDeep: "#56720a",
  limeTint: "#f0f9cf",
} as const;
