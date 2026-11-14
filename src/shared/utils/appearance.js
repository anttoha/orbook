// ─────────────────────────────────────────────────────────────
// Оформление (часть 30a): Design, Akzentfarbe, фон для Glas, «Animationen».
// Настройки лежат в userStore; отсюда — только «что поставить на <html>».
// Сами цвета и радиусы — наборы токенов в index.css: [data-design="glas"], [data-accent="blau"] …
// Поэтому компоненты ничего не знают об оформлениях, а новое оформление = ещё один набор токенов.
// ─────────────────────────────────────────────────────────────

export const DESIGNS = ["soft", "glas", "klar"];
export const ACCENTS = ["violett", "blau", "gruen", "orange", "pink", "grafit"];
export const GLASS_BGS = ["aurora", "abendrot", "meer", "wald"];
export const GLASS_MODES = ["voll", "einfach"];
export const MOTIONS = ["voll", "weniger", "aus"];

// Как сейчас у всех: кто ничего не менял, видит приложение как раньше.
// motion: null — «как в системе»: «уменьшить движение» включено → «weniger», иначе «voll»
export const APPEARANCE_DEFAULTS = { design: "soft", accent: "violett", glassBg: "aurora", glassMode: "voll", motion: null };

const pick = (list, value) => (list.includes(value) ? value : list[0]);

// Какое движение действует сейчас: выбор пользователя, иначе — настройка системы
export const effectiveMotion = (motion, systemReduced) => (MOTIONS.includes(motion) ? motion : systemReduced ? "weniger" : "voll");

// Настройки → атрибуты <html> (dataset). Незнакомые значения (из Sync со старой/новой версии) — по умолчанию
export function appearanceAttrs(settings, systemReduced = false) {
  const s = settings ?? {};
  return {
    design: pick(DESIGNS, s.design),
    accent: pick(ACCENTS, s.accent),
    glassBg: pick(GLASS_BGS, s.glassBg),
    glass: pick(GLASS_MODES, s.glassMode),
    motion: effectiveMotion(s.motion, systemReduced),
  };
}

// Снимок оформления для сравнения и для Sync
export const appearanceOf = (user) => ({
  design: user.design ?? APPEARANCE_DEFAULTS.design,
  accent: user.accent ?? APPEARANCE_DEFAULTS.accent,
  glassBg: user.glassBg ?? APPEARANCE_DEFAULTS.glassBg,
  glassMode: user.glassMode ?? APPEARANCE_DEFAULTS.glassMode,
  motion: user.motion ?? null,
});

const browser = typeof window !== "undefined" && typeof document !== "undefined";
const reducedQuery = browser ? window.matchMedia?.("(prefers-reduced-motion: reduce)") : null;

// Поставить атрибуты на <html>. Вне браузера (Vitest в Node) — ничего
export function applyAppearance(user) {
  if (!browser) return;
  Object.assign(document.documentElement.dataset, appearanceAttrs(appearanceOf(user), Boolean(reducedQuery?.matches)));
}
