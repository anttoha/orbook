// ─────────────────────────────────────────────────────────────
// Кольори предметів. Є 8 «палітр» (кольори з Figma, задані в index.css).
// Повні рядки класів — бо Tailwind не знаходить класи, зібрані як `bg-${name}-tint`.
// ─────────────────────────────────────────────────────────────

// Палітри: tint — світла плашка (фон + текст), text — тільки колір тексту, solid — насичений колір (кружки), border — рамка вибраного предмета, label — назва кольору
export const PALETTES = {
  deutsch: { tint: "bg-deutsch-tint text-deutsch-text", text: "text-deutsch-text", solid: "bg-deutsch-solid", border: "border-deutsch-solid", label: "Rosa" },
  mathe: { tint: "bg-mathe-tint text-mathe-text", text: "text-mathe-text", solid: "bg-mathe-solid", border: "border-mathe-solid", label: "Blau" },
  englisch: { tint: "bg-englisch-tint text-englisch-text", text: "text-englisch-text", solid: "bg-englisch-solid", border: "border-englisch-solid", label: "Orange" },
  physik: { tint: "bg-physik-tint text-physik-text", text: "text-physik-text", solid: "bg-physik-solid", border: "border-physik-solid", label: "Türkis" },
  geschichte: { tint: "bg-geschichte-tint text-geschichte-text", text: "text-geschichte-text", solid: "bg-geschichte-solid", border: "border-geschichte-solid", label: "Gold" },
  kunst: { tint: "bg-kunst-tint text-kunst-text", text: "text-kunst-text", solid: "bg-kunst-solid", border: "border-kunst-solid", label: "Lila" },
  sport: { tint: "bg-sport-tint text-sport-text", text: "text-sport-text", solid: "bg-sport-solid", border: "border-sport-solid", label: "Grau" },
  biologie: { tint: "bg-biologie-tint text-biologie-text", text: "text-biologie-text", solid: "bg-biologie-solid", border: "border-biologie-solid", label: "Grün" },
};

// Код предмета зі шкільного плану (subject.code) → палітра за замовчуванням (як у дизайні).
// У даних школи біологія має код "Bi" (не "Bio").
export const DEFAULT_PALETTE = {
  De: "deutsch",
  Ma: "mathe",
  En: "englisch",
  Ph: "physik",
  Ge: "geschichte",
  Ku: "kunst",
  Sp: "sport",
  Bi: "biologie",
};
