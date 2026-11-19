// ─────────────────────────────────────────────────────────────
// search.js — що показує пошук ⌘K (ПК, макет 51): групи Stunden, Klausuren, Notizen, Einstellungen
// і завжди внизу «Aktionen». Без React: компонент тільки малює і виконує target.
// target: { sheet, params } — відкрити шторку, { path } — перейти, { action } — дія сторінки.
// ─────────────────────────────────────────────────────────────
import { daysLeftText, longDate, subjectName, weekdayLong, weekdayShort } from "./format";
import { visibleNotes } from "./notes";
import { translate } from "../i18n/translate";

// Скільки рядків у кожній групі, щоб вікно не ставало вищим за екран
const LIMITS = { Stunden: 4, Tests: 3, Notizen: 3, Einstellungen: 3 };

// Статус уроку словами — перший шматок другого рядка: «Vertretung · Kle · Raum 204»
const STATUS_WORDS = { get substitution() { return translate("Vertretung"); }, moved: "Verlegt", added: "Zusatzstunde", get cancelled() { return translate("Fällt aus"); }, get room_change() { return translate("Raumänderung"); } };

// «19.09.» — дата з нулями, як на макеті
const dottedDate = (iso) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;

// Слова запиту малими літерами («  Mathe mi » → ["mathe", "mi"])
export const queryWords = (query) => query.trim().toLowerCase().split(/\s+/).filter(Boolean);

// Чи є кожне слово в тексті елемента
const matches = (haystack, words) => {
  const text = haystack.filter(Boolean).join(" ").toLowerCase();
  return words.every((word) => text.includes(word));
};

const lessonItems = (days) =>
  days.flatMap((day) =>
    day.lessons.map((lesson) => {
      const name = subjectName(lesson.subject);
      return {
        id: `l-${day.date}-${lesson.period}-${lesson.subject?.code ?? ""}-${lesson.course?.nr ?? ""}`,
        subject: lesson.subject ?? null,
        title: translate("{name} · {v2}, {period}. Stunde", { name, v2: weekdayShort(day.date), period: lesson.period }),
        subtitle: [STATUS_WORDS[lesson.status], lesson.teacher, lesson.room && translate("Raum {room}", { room: lesson.room })].filter(Boolean).join(" · "),
        haystack: [name, lesson.subject?.code, lesson.teacher, lesson.room, lesson.course?.label, weekdayLong(day.date), STATUS_WORDS[lesson.status]],
        target: { sheet: "stunde", params: { datum: day.date, stunde: lesson.period, fach: lesson.subject?.code } },
      };
    }),
  );

const examItems = (exams) =>
  exams.map((exam) => {
    const name = subjectName(exam.subject);
    return {
      id: `e-${exam.id}`,
      subject: exam.subject ?? null,
      title: `${exam.type} ${name} · ${weekdayShort(exam.date)} ${dottedDate(exam.date)}`,
      subtitle: [exam.topic, daysLeftText(exam.daysLeft)].filter(Boolean).join(" · "),
      haystack: [exam.type, name, exam.subject?.code, exam.topic, translate("Test")],
      target: { sheet: "klausur", params: { id: exam.id } },
    };
  });

const noteItems = (notes) =>
  visibleNotes(notes).map((note) => ({
    id: `n-${note.id}`,
    icon: "note",
    title: note.text.split("\n")[0], // перший рядок нотатки
    subtitle: translate("Notiz · {v1}, {v2}", { v1: weekdayShort(note.date), v2: longDate(note.date) }),
    haystack: [note.text, translate("Notiz")],
    target: { sheet: "notiz", params: note.period ? { datum: note.date, stunde: note.period } : { datum: note.date, id: note.id } },
  }));

const settingItems = (sections) =>
  sections.map((section) => ({
    id: `s-${section.to}`,
    icon: "settings",
    title: section.label,
    subtitle: translate("Einstellungen"),
    haystack: [section.label, translate("Einstellungen")],
    target: { path: section.to },
  }));

// Групи результатів. Порожній запит — порожньо (тоді у вікні лише «Aktionen»).
// days — дні поточного тижня, exams — найближчі, notes — нотатки, sections — розділи Einstellungen
export function searchGroups(query, { days = [], exams = [], notes = [], sections = [] }) {
  const words = queryWords(query);
  if (words.length === 0) return [];
  const groups = [
    { title: translate("Stunden"), items: lessonItems(days) },
    { title: translate("Tests"), items: examItems(exams) },
    { title: translate("Notizen"), items: noteItems(notes) },
    { title: translate("Einstellungen"), items: settingItems(sections) },
  ];
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(item.haystack, words)).slice(0, LIMITS[group.title]) }))
    .filter((group) => group.items.length > 0);
}

// «Aktionen» — завжди внизу вікна. canCreate — є право записувати Klausur; dark — тема зараз темна
export const searchActions = ({ canCreate, today, dark }) => ({
  title: translate("Aktionen"),
  items: [
    { id: "a-exam", icon: "plus", title: translate("Test eintragen"), subtitle: canCreate ? translate("Für die ganze Klasse") : translate("braucht Editor-Code"), kbd: "K", target: { action: "exam" } },
    { id: "a-today", icon: "calendar", title: translate("Zu heute springen"), subtitle: `${weekdayLong(today)}, ${longDate(today)}`, kbd: "T", target: { path: "/heute" } },
    { id: "a-theme", icon: dark ? "sun" : "moon", title: dark ? "Helles Design" : "Dunkles Design", subtitle: "Darstellung umschalten", target: { action: "theme" } },
  ],
});
