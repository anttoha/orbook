// ─────────────────────────────────────────────────────────────
// Часть 31b/31d: Android-Widget. Чистые функции без React — их проверяет widgetSnapshot.test.js.
//
// Снимок для приложения (ORBookAndroid.saveSnapshot): то, чего нет на сервере, но нужно виджету —
// классы устройства, «Meine Kurse» каждого класса (как courses/hidden у /api/stats), последние заметки,
// галочки домашек, свои цвета предметов, тема и тексты виджета на языке приложения.
// Сам план, тесты и домашки виджет берёт у сервера: GET /api/widget.
// ─────────────────────────────────────────────────────────────
import { translate, translateTo } from "../i18n/translate";
import { appearanceOf } from "./appearance";
import { DEFAULT_FUER_DICH, cleanFuerDich } from "./fuerDich";
import { planOf } from "./planView";
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
  // часть 31d: «+ N weitere», «Danach» у большого «Jetzt», Countdown в календарных днях
  "+ {n} weitere", "Danach", "Vertr.", "Tag", "Tage",
  // часть 31e: уведомления самого приложения и виджет без сети
  "In {n} min", "{n}. Std", "Neuer Test", "Hausaufgabe", "Test", "Test: Mitteilungen kommen an", "Keine Verbindung",
  "Plan und Tests", "Vor der Stunde", "{n} Änderungen im Plan",
  // часть 36c: уведомление о новой оценке (канал «Noten»)
  "Noten", "Neue Note in {n}", "Neue Noten in {n}",
  // часть 39: виджеты Noten, Neue Noten, Fehlzeiten
  "Neue Noten", "Fehlzeiten", "Schnitt", "Neu:", "neu", "In ORBook bei Noten anmelden", "Noch keine Noten", "Keine Fehlzeiten",
  "Fehltage", "Fehlstunden", "unentschuldigt", "entschuldigt", "unentsch.", "Std.", "Zuletzt", "Ganzer Tag", "{n}. Halbjahr",
  // часть 50c: виджеты «Für dich jetzt» и «Wetter» (виджет подставляет и {time}, {fach} … — одно место на текст)
  "Für dich jetzt", "Für dich", "Für morgen", "Nächster Schultag", "los in {n} min", "los!", "Losgehen {time}", "Heute bis {t}°",
  "Regen {from}", "ab {h} Uhr", "trocken", "Wetter", "Keine Wetterdaten", "Stand {time}", "Regenjacke", "Jacke", "Mütze & Schal",
  "Sonnencreme", "Test: {fach}", "Tage frei", "Schule wieder {date}", "bis morgen",
];

const NOTES_IN_WIDGET = 5;

// «Meine Kurse» класса → параметры для /api/widget (как statsPath: «keine» идёт как есть — сервер его не знает
// и показывает только Pflicht-Kurse)
const coursesOf = (data) => ({ courses: data?.picked ?? [], hidden: data?.hiddenRequired ?? [] });

// Поля класса: у открытого — наверху userStore, у остальных — в byClass (часть 29)
const classData = (user, id, activeId) => (id === activeId || activeId == null ? user : user.byClass?.[id]);

// Часть 31d: настройки приложения, от которых зависит вид или содержание блоков Start, — виджет повторяет их
// («Wie App» в «Widget einstellen»). Новая такая настройка → сюда, тест «каждая настройка есть в снимке» проверит.
export const WIDGET_APP_SETTINGS = ["design", "accent", "glassBg", "glassMode", "plan", "showWeekend", "fontScale", "colorOverrides"];

const lookOf = (user) => {
  const { design, accent, glassBg, glassMode } = appearanceOf(user);
  return { design, accent, glassBg, glassMode, fontScale: [1, 2, 3].includes(user.fontScale) ? user.fontScale : 2 };
};

// fallbackName — имя класса, если сервер ещё без классов (часть 29): тогда один класс без id
export function buildSnapshot({ classes = [], activeId = null, user = {}, marks = [], theme = "system", lang = "de", fallbackName = "", fuerDich = DEFAULT_FUER_DICH }) {
  const list = classes.length ? classes : [{ id: null, name: fallbackName }];
  return {
    v: 2,
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
    look: lookOf(user), // Design, Akzent, фон Glas, размер шрифта
    plan: planOf(user.plan), // «Stundenplan»: Kürzel/Name, Raum, Lehrkraft, Ausfall …
    showWeekend: Boolean(user.showWeekend),
    activeId, // часть 31e: «Vor der Stunde» напоминает об уроках открытого класса
    fuerDich: cleanFuerDich(fuerDich), // часть 50c: настройки «Für dich jetzt» — виджет решает по ним, как блок на Start
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
  { kind: "fuerDich", get hint() { return translate("Was du gerade brauchst"); } },
  { kind: "wetter", get hint() { return translate("Heute und Losgehen"); } },
];

// Блок Start для превью: размер по клеткам виджета (узкий — Klein, высокий — Groß)
export function previewSize(widget) {
  if (widget.cols <= 2) return "klein";
  return widget.rows >= 3 ? "gross" : "breit";
}
