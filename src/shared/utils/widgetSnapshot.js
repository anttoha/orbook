// ─────────────────────────────────────────────────────────────
// Часть 31b: Android-Widget. Чистые функции без React — их проверяет widgetSnapshot.test.js.
//
// Снимок для приложения (ORBookAndroid.saveSnapshot): то, чего нет на сервере, но нужно виджету —
// классы устройства, «Meine Kurse» каждого класса (как courses/hidden у /api/stats), последние заметки,
// галочки домашек, свои цвета предметов, тема и тексты виджета на языке приложения.
// Сам план, тесты и домашки виджет берёт у сервера: GET /api/widget.
// ─────────────────────────────────────────────────────────────
import { translate, translateTo } from "../i18n/translate";
import { latestNotes } from "./startData";

// Тексты, которые рисует сам виджет (android/…/widget/OrbWidget.kt). {n} подставляет виджет.
// Новый текст в виджете — сюда и в оба словаря (en.js, uk.js), тест проверит
export const WIDGET_TEXTS = [
  "Jetzt", "Gleich", "noch {n} min", "in {n} min", "{n}. Stunde", "{n} Stunde", "{n} Stunden", "Raum {n}",
  "Vertretung", "vertreten", "Raumwechsel", "fällt aus", "dann {n}", "Heute", "Morgen", "Wochenende", "Frei",
  "Kein Unterricht", "Keine Änderungen", "{n} Änderungen", "Woche", "KW", "Tests", "Keine Tests", "Aufgaben",
  "offen", "Alles erledigt", "bis {n}", "heute", "morgen", "in {n} Tagen", "Änderungen", "Termine", "Keine Termine",
  "Notizen", "Keine Notizen", "Countdown", "Schultag", "Schultage", "Keine Ferien eingetragen", "Gerade frei",
  "Stand {n}", "Nicht angemeldet", "Öffnen", "Zugang beendet", "Neuer Code", "Klasse {n}",
];

const NOTES_IN_WIDGET = 5;

// «Meine Kurse» класса → параметры для /api/widget (как statsPath: «keine» идёт как есть — сервер его не знает
// и показывает только Pflicht-Kurse)
const coursesOf = (data) => ({ courses: data?.picked ?? [], hidden: data?.hiddenRequired ?? [] });

// Поля класса: у открытого — наверху userStore, у остальных — в byClass (часть 29)
const classData = (user, id, activeId) => (id === activeId || activeId == null ? user : user.byClass?.[id]);

// fallbackName — имя класса, если сервер ещё без классов (часть 29): тогда один класс без id
export function buildSnapshot({ classes = [], activeId = null, user = {}, marks = [], theme = "system", lang = "de", fallbackName = "" }) {
  const list = classes.length ? classes : [{ id: null, name: fallbackName }];
  return {
    v: 1,
    classes: list
      .filter((item) => !item.gone)
      .map((item) => {
        const data = classData(user, item.id, activeId);
        return {
          id: item.id,
          name: item.label?.trim() || item.name || "",
          ...coursesOf(data),
          notes: latestNotes(data?.notes ?? [], NOTES_IN_WIDGET).map((note) => note.text.trim()),
        };
      }),
    done: marks.filter((m) => m.done).map((m) => String(m.id)),
    palette: { ...(user.colorOverrides ?? {}) },
    theme: theme === "light" || theme === "dark" ? theme : null,
    lang,
    texts: Object.fromEntries(WIDGET_TEXTS.map((key) => [key, translateTo(lang, key)])),
  };
}

// ── «Widget einstellen» ──

// Что может показывать виджет (как блоки Start, без Materialien и Statistik) и подпись под названием
export const WIDGET_KINDS = [
  { kind: "jetzt", get hint() { return translate("Aktuelle und nächste Stunde"); } },
  { kind: "heute", get hint() { return translate("Alle Stunden, abends schon morgen"); } },
  { kind: "woche", get hint() { return translate("Die ganze Woche"); } },
  { kind: "tests", get hint() { return translate("Was als Nächstes ansteht"); } },
  { kind: "aufgaben", get hint() { return translate("Offene Hausaufgaben"); } },
  { kind: "aenderungen", get hint() { return translate("Ausfall und Vertretung"); } },
  { kind: "termine", get hint() { return translate("Ferien, Elternabend, Ausflug"); } },
  { kind: "notizen", get hint() { return translate("Deine letzten Notizen"); } },
  { kind: "countdown", get hint() { return translate("Tage bis zu den Ferien"); } },
];

export const LOOKS = [
  { value: "app", label: "App" },
  { value: "hell", label: "Hell" },
  { value: "dunkel", label: "Dunkel" },
];
export const BACKGROUNDS = [
  { value: "voll", label: "Voll" },
  { value: "halb", label: "Halb" },
];

export const DEFAULT_WIDGET = { kind: "jetzt", classId: null, mine: true, look: "app", background: "voll" };

// Ответ ORBookAndroid.widget(id) / widgets() — строка JSON. Что-то не то → null / []
export function parseWidget(json) {
  try {
    const w = typeof json === "string" ? JSON.parse(json) : null;
    if (!Number.isInteger(w?.id)) return null;
    return {
      id: w.id,
      kind: WIDGET_KINDS.some((k) => k.kind === w.kind) ? w.kind : DEFAULT_WIDGET.kind,
      classId: Number.isInteger(w.classId) ? w.classId : null,
      mine: w.mine !== false,
      look: LOOKS.some((l) => l.value === w.look) ? w.look : "app",
      background: w.background === "halb" ? "halb" : "voll",
      cols: Number.isInteger(w.cols) ? w.cols : 4,
      rows: Number.isInteger(w.rows) ? w.rows : 2,
    };
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

// «4 × 2»
export const cellsLabel = (widget) => `${widget.cols} × ${widget.rows}`;

// Блок Start для превью: размер по клеткам виджета (узкий — Klein, высокий — Groß)
export function previewSize(widget) {
  if (widget.cols <= 2) return "klein";
  return widget.rows >= 3 ? "gross" : "breit";
}

// Класс виджета: сохранённый, если он ещё есть на устройстве, иначе открытый
export const widgetClass = (widget, classes, activeId) =>
  classes.some((c) => c.id === widget.classId) ? widget.classId : (activeId ?? classes[0]?.id ?? null);
