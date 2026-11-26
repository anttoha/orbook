// ─────────────────────────────────────────────────────────────
// Настройки «Für dich jetzt» (часть 50b) — одни для блока на Start и для виджета.
// Только на устройстве (localStorage «orbook.fuerDich») и в Sync (свой блок, fuerDichSync.js).
// Здесь чистые функции: значения по умолчанию, проверка пришедшего, шаги степперов, вещи по предметам.
// ─────────────────────────────────────────────────────────────

export const ITEM_MAX = 40; // символов в одной вещи
export const ITEMS_PER_SUBJECT = 10;

export const DEFAULT_FUER_DICH = {
  leaveMinutes: 45,
  eveningFrom: "17:00",
  show: { wetter: true, mitnehmen: true, hausaufgaben: true, tests: true, aenderungen: true, termine: false },
  onlyMine: true,
  tips: { regenjacke: 50, jacke: 12, muetze: 3, sonnencreme: 6 },
  testReminder: true,
  items: { Sp: ["Sportsachen"] }, // вещь — свободный текст; «Sportsachen» тоже можно убрать
};

// Шаги степперов. null — «Aus»: стоит с той стороны, где совет и так показывается реже
const range = (from, to, step = 1) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);
const clockSteps = () => range(14 * 60, 22 * 60, 30).map((m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
export const STEPS = {
  leaveMinutes: range(5, 120, 5),
  eveningFrom: clockSteps(),
  regenjacke: [...range(10, 90, 10), null], // «ab 50 %»: выше — реже
  jacke: [null, ...range(0, 20)], // «unter 12°»: ниже — реже
  muetze: [null, ...range(-10, 10)],
  sonnencreme: [...range(1, 11), null], // UV
};

// Соседнее значение в списке шагов (dir = -1 | 1). Незнакомое значение — ближайшее «по умолчанию»
export function stepValue(steps, value, dir) {
  const at = steps.indexOf(value);
  if (at < 0) return steps[0];
  return steps[Math.min(steps.length - 1, Math.max(0, at + dir))];
}
export const canStep = (steps, value, dir) => {
  const at = steps.indexOf(value);
  return at >= 0 && at + dir >= 0 && at + dir < steps.length;
};

// Вещь: без пробелов по краям, не длиннее ITEM_MAX
export const cleanItem = (text) => (typeof text === "string" ? text.trim().slice(0, ITEM_MAX) : "");

const sameText = (a, b) => a.toLocaleLowerCase("de") === b.toLocaleLowerCase("de");

// Добавить вещь предмету code. Пустое, повтор или больше 10 — список не меняется
export function addItem(items, code, text) {
  const item = cleanItem(text);
  const list = items[code] ?? [];
  if (!item || list.length >= ITEMS_PER_SUBJECT || list.some((x) => sameText(x, item))) return items;
  return { ...items, [code]: [...list, item] };
}

// Переименовать вещь (пустое — убрать)
export function renameItem(items, code, index, text) {
  const item = cleanItem(text);
  const list = items[code] ?? [];
  if (!item) return removeItem(items, code, index);
  if (list.some((x, i) => i !== index && sameText(x, item))) return removeItem(items, code, index);
  return { ...items, [code]: list.map((x, i) => (i === index ? item : x)) };
}

// Убрать вещь; у предмета ничего не осталось — убрать и предмет (пустой список = «ничего не брать»)
export function removeItem(items, code, index) {
  const list = (items[code] ?? []).filter((_, i) => i !== index);
  const next = { ...items };
  if (list.length) next[code] = list;
  else delete next[code];
  return next;
}

// Сколько предметов с вещами: «4 Fächer»
export const subjectsWithItems = (items) => Object.values(items ?? {}).filter((list) => list.length > 0).length;

const pick = (value, steps, fallback) => (steps.includes(value) ? value : fallback);

// Пришедшее из localStorage или Sync (могла быть другая версия приложения) → годные настройки
export function cleanFuerDich(saved) {
  const d = DEFAULT_FUER_DICH;
  const s = saved && typeof saved === "object" ? saved : {};
  const show = Object.fromEntries(Object.entries(d.show).map(([key, on]) => [key, typeof s.show?.[key] === "boolean" ? s.show[key] : on]));
  const tips = Object.fromEntries(Object.entries(d.tips).map(([key, value]) => [key, s.tips && key in s.tips ? pick(s.tips[key], STEPS[key], value) : value]));
  const items = {};
  if (s.items && typeof s.items === "object") {
    for (const [code, list] of Object.entries(s.items)) {
      if (!Array.isArray(list)) continue;
      const clean = list.map(cleanItem).filter(Boolean).slice(0, ITEMS_PER_SUBJECT);
      if (clean.length) items[code] = clean;
    }
  }
  return {
    leaveMinutes: pick(s.leaveMinutes, STEPS.leaveMinutes, d.leaveMinutes),
    eveningFrom: pick(s.eveningFrom, STEPS.eveningFrom, d.eveningFrom),
    show,
    onlyMine: typeof s.onlyMine === "boolean" ? s.onlyMine : d.onlyMine,
    tips,
    testReminder: typeof s.testReminder === "boolean" ? s.testReminder : d.testReminder,
    items: s.items && typeof s.items === "object" ? items : { ...d.items },
  };
}
