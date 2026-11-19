// ─────────────────────────────────────────────────────────────
// Часть 31d: настройка одного виджета («Widget einstellen»). Чистые функции — их проверяет widgetConfig.test.js.
// Хранит настройку само приложение (android/…/widget/WidgetStore.kt, WidgetConfig) — поля там те же.
// «app» — «Wie App»: виджет повторяет «Darstellung» и «Stundenplan» приложения, пока не выбрали своё.
// ─────────────────────────────────────────────────────────────
import { ACCENTS } from "./appearance";

// Значения по умолчанию. Кто ничего не трогал, видит виджет как приложение
export const WIDGET_DEFAULTS = {
  kind: "jetzt",
  classId: null,
  mine: true, // «Nur meine Kurse»
  // Aussehen
  look: "app", // светлый/тёмный: app | hell | dunkel
  design: "app", // app | soft | glas | klar
  accent: "app", // app | violett | blau …
  font: "m", // s | m | l
  alpha: 100, // фон карточки, %: 0 — только текст на обоях
  // Anzeige (у «Heute» и «Jetzt»)
  onlyChanges: false,
  evening: true, // «Abends schon morgen»
  subject: "app", // app | kuerzel | name
  place: "app", // «Raum · Lehrkraft»: app | raum | beides
  cancelled: "app", // «Ausfall»: app | ausblenden
  // по видам
  next: true, // Jetzt: «Danach zeigen»
  progress: true, // Jetzt: полоска
  weekend: "next", // Woche: в выходные — следующая неделя | пусто
  cell: "kuerzel", // Woche: kuerzel | raum | lehrkraft («+ Raum», «+ Lehrkraft»)
  testsDays: 14, // Tests: 7 | 14 | 0 (все)
  showDone: false, // Aufgaben
  sort: "faellig", // Aufgaben: faellig | fach
  changes: "morgen", // Änderungen: heute | morgen («+ Morgen») | woche
  termineDays: 90, // Termine: 30 | 90 | 0 (все)
  count: "schultage", // Countdown: schultage | tage
  // Verhalten
  refresh: 30, // минут: 15 | 30 | 60
  open: "auto", // что открыть по нажатию: auto (по виду) | tag | woche | tests | start
};

export const WIDGET_KIND_LIST = ["jetzt", "heute", "woche", "tests", "aufgaben", "aenderungen", "termine", "notizen", "countdown"];

// Допустимые значения выборов. Чужое или старое значение → по умолчанию (как planOf)
export const WIDGET_CHOICES = {
  kind: WIDGET_KIND_LIST,
  look: ["app", "hell", "dunkel"],
  design: ["app", "soft", "glas", "klar"],
  accent: ["app", ...ACCENTS],
  font: ["s", "m", "l"],
  subject: ["app", "kuerzel", "name"],
  place: ["app", "raum", "beides"],
  cancelled: ["app", "ausblenden"],
  weekend: ["next", "leer"],
  cell: ["kuerzel", "raum", "lehrkraft"],
  testsDays: [7, 14, 0],
  sort: ["faellig", "fach"],
  changes: ["heute", "morgen", "woche"],
  termineDays: [30, 90, 0],
  count: ["schultage", "tage"],
  refresh: [15, 30, 60],
  open: ["auto", "tag", "woche", "tests", "start"],
};

const clampAlpha = (value) => (Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value / 10) * 10)) : null);

// Ответ моста → полная настройка. Старая настройка 31b («background: halb») становится прозрачностью 70 %
export function widgetConfigOf(raw) {
  const w = raw ?? {};
  const config = { ...WIDGET_DEFAULTS };
  for (const key of Object.keys(WIDGET_DEFAULTS)) {
    const value = w[key];
    if (WIDGET_CHOICES[key]) {
      if (WIDGET_CHOICES[key].includes(value)) config[key] = value;
    } else if (typeof WIDGET_DEFAULTS[key] === "boolean") {
      if (typeof value === "boolean") config[key] = value;
    }
  }
  config.classId = Number.isInteger(w.classId) ? w.classId : null;
  config.alpha = clampAlpha(w.alpha) ?? (w.background === "halb" ? 70 : 100);
  return config;
}

// Ответ ORBookAndroid.widget(id) / widgets() — строка JSON. Что-то не то → null / []
export function parseWidget(json) {
  try {
    const w = typeof json === "string" ? JSON.parse(json) : null;
    if (!Number.isInteger(w?.id)) return null;
    return { id: w.id, ...widgetConfigOf(w), cols: Number.isInteger(w.cols) ? w.cols : 4, rows: Number.isInteger(w.rows) ? w.rows : 2 };
  } catch {
    return null;
  }
}

export function parseWidgets(json) {
  try {
    const list = typeof json === "string" ? JSON.parse(json) : null;
    return Array.isArray(list) ? list.map((w) => parseWidget(JSON.stringify(w))).filter(Boolean) : [];
  } catch {
    return [];
  }
}

// Что сохранить (без id и размера — их знает Android)
export const configToSave = (draft) => Object.fromEntries(Object.keys(WIDGET_DEFAULTS).map((key) => [key, draft[key]]));

// Какие строки «Anzeige» есть у вида (макет 31d handy-12/13). «Nur meine Kurse» — у всех, кроме заметок
export const WIDGET_ROWS = {
  jetzt: ["mine", "next", "progress", "place"],
  heute: ["mine", "onlyChanges", "subject", "place", "evening", "cancelled"],
  woche: ["mine", "weekend", "cell", "cancelled"],
  tests: ["mine", "testsDays"],
  aufgaben: ["mine", "showDone", "sort"],
  aenderungen: ["mine", "changes"],
  termine: ["termineDays"],
  notizen: [],
  countdown: ["count"],
};

// «4 × 2»
export const cellsLabel = (widget) => `${widget.cols} × ${widget.rows}`;

// Класс виджета: сохранённый, если он ещё есть на устройстве, иначе открытый
export const widgetClass = (widget, classes, activeId) =>
  classes.some((c) => c.id === widget.classId) ? widget.classId : (activeId ?? classes[0]?.id ?? null);
