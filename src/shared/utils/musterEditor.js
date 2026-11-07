// ─────────────────────────────────────────────────────────────
// musterEditor.js — редактор Muster в адмінці (частина 19b, design/neu/19b-muster-editor).
//
// Сервер (GET /api/admin/muster) дає дві сітки тижнів A і B:
//   weeks — своя сітка адміна (null — ще не зберігали), auto — що будує автоматика з планів.
// Урок сітки: { weekday: 0 (Mo) … 4 (Fr), period, subject: "Ma", course: { nr, label } | null, teacher, room }.
// Тут — чисті функції: клітинки, «своя правка», лічильник змін, рядки сітки, букви тижнів.
// ─────────────────────────────────────────────────────────────
import { addDays, isoWeek, mondayOf } from "./format";
import { abLetter } from "./muster";

export const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr"];
export const WEEKDAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
export const EMPTY_WEEKS = { A: [], B: [] };
const MIN_PERIODS = 6; // стільки рядків завжди (як у сітці тижня), навіть якщо уроків менше

// Уроки однієї клітинки (день + номер уроку), у сталому порядку
export const slotLessons = (lessons, weekday, period) =>
  (lessons ?? []).filter((l) => l.weekday === weekday && l.period === period).sort((a, b) => entryKey(a).localeCompare(entryKey(b)));

// Що саме в уроці (для порівняння): предмет, курс, учитель, кабінет
const entryKey = (l) => [l.subject, l.course?.nr ?? "", l.teacher ?? "", l.room ?? ""].join("|");

// Замінити вміст клітинки (entries — нові уроки без weekday/period або з ними)
export function setSlot(lessons, weekday, period, entries) {
  const rest = (lessons ?? []).filter((l) => !(l.weekday === weekday && l.period === period));
  return [...rest, ...entries.map((e) => ({ ...e, weekday, period }))];
}

// Чи однакові дві клітинки (порядок курсів не важливий)
export function sameSlot(a, b) {
  const keys = (list) => list.map(entryKey).sort().join("\n");
  return keys(a) === keys(b);
}

// Усі клітинки, де є хоч один урок у будь-якій із двох сіток
function usedSlots(...lists) {
  const keys = new Set();
  lists.flat().forEach((l) => l && keys.add(`${l.weekday}-${l.period}`));
  return [...keys].map((key) => key.split("-").map(Number));
}

// «Своя правка» (крапка на клітинці): клітинка сітки адміна не така, як в автоматиці
export const isOwnChange = (lessons, autoLessons, weekday, period) => !sameSlot(slotLessons(lessons, weekday, period), slotLessons(autoLessons, weekday, period));

// Скільки клітинок змінено в чернетці порівняно з базою (обидва тижні). Для «Speichern · 2 Änderungen»
export function changeCount(base, draft) {
  let count = 0;
  for (const letter of ["A", "B"]) {
    const a = base?.[letter] ?? [];
    const b = draft?.[letter] ?? [];
    count += usedSlots(a, b).filter(([d, p]) => !sameSlot(slotLessons(a, d, p), slotLessons(b, d, p))).length;
  }
  return count;
}

// Текст кнопки збереження
export const saveLabel = (count) => (count === 0 ? "Speichern" : count === 1 ? "Speichern · 1 Änderung" : `Speichern · ${count} Änderungen`);

// Рядки сітки: уроки 1…6 завжди, а 0 і 7–10 — лише якщо вони є в одній із сіток.
// Час — з lessonTimes ([{ period, start, end }]); немає — тільки номер (start/end = null)
export function gridPeriods(lessonTimes, ...weekLists) {
  const used = new Set(weekLists.flat().filter(Boolean).map((l) => l.period));
  const last = Math.max(MIN_PERIODS, ...used);
  const times = new Map((lessonTimes ?? []).map((t) => [t.period, t]));
  const rows = [];
  for (let period = used.has(0) ? 0 : 1; period <= last; period += 1) {
    rows.push({ period, start: times.get(period)?.start ?? null, end: times.get(period)?.end ?? null });
  }
  return rows;
}

// Урок із курсу (/api/admin/courses): предмет і вчитель курсу, кабінет — як був
export const lessonFromCourse = (course, room = null) => ({
  subject: course.subject.code,
  course: { nr: course.nr, label: course.label },
  teacher: course.teacher ?? null,
  room,
});

// Підпис курсу на чипі: назва предмета; у групи — ще й мітка («Sport · SpJu»)
export function courseChipLabel(course) {
  const name = course.subject?.name ?? course.subject?.code ?? course.label;
  return course.group ? `${name} · ${course.group}` : name;
}

// «Automatisch war: Mathe · T03 · Raum 305» (кілька курсів — через « / »; порожньо — «frei»)
export function autoText(entries, names = {}) {
  if (!entries.length) return "frei";
  return entries.map((l) => [names[l.subject] ?? l.subject, l.teacher, l.room && `Raum ${l.room}`].filter(Boolean).join(" · ")).join(" / ");
}

// Тиждень A/B, який буде при цьому режимі (schoolWeek — як рахує школа: 1/2/null)
export function weekForMode(mode, schoolWeek) {
  if (mode === "none" || (schoolWeek !== 1 && schoolWeek !== 2)) return null;
  return mode === "swap" ? 3 - schoolWeek : schoolWeek;
}

// Смужка «So zählt ORBook»: цей і наступні тижні з буквою. week — тиждень зараз (1/2/null)
export function kwStrip(today, week, count = 5) {
  const monday = mondayOf(today);
  return Array.from({ length: count }, (_, i) => ({
    kw: isoWeek(addDays(monday, i * 7)),
    letter: abLetter(week) ? abLetter(i % 2 === 0 ? week : 3 - week) : null,
  }));
}

// Копія сітки (щоб правити чернетку, не чіпаючи дані сервера)
export const copyWeeks = (weeks) => ({ A: [...(weeks?.A ?? [])], B: [...(weeks?.B ?? [])] });

// Помилка сервера 422 → номер поля «weeks.A.3» → клітинка, яку підсвітити ({ letter, weekday, period }) або null
export function badSlot(error, weeks) {
  const field = error?.details?.fields?.[0]?.field ?? "";
  const match = /^weeks\.([AB])\.(\d+)/.exec(field);
  const lesson = match && weeks?.[match[1]]?.[Number(match[2])];
  return lesson ? { letter: match[1], weekday: lesson.weekday, period: lesson.period } : null;
}
