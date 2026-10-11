// ─────────────────────────────────────────────────────────────
// lessons.js — помічники для уроків з сервера (кольори, групування по уроках, Klausur).
//
// Урок із сервера (GET /api/week, /api/day) виглядає так:
//   { period: 4, start: "10:20", end: "11:05", status: "substitution",
//     subject: { code: "En", name: "Englisch" }, teacher: "T26", room: "305",
//     course: { nr: "133", label: "En" }, changes: { teacher: { old: "T25", new: "T26" } },
//     moved: null, info: "für En (T25)", examId: null }
// status: normal | cancelled | substitution | room_change | moved | added
// ─────────────────────────────────────────────────────────────
import { DEFAULT_PALETTE, PALETTES } from "../constants/fachColors";
import { addDays, isWeekend, lessonCaption, mondayOf, movedText, weekdayShort } from "./format";

const PALETTE_KEYS = Object.keys(PALETTES); // ["deutsch", "mathe", …]

// Палітра предмета: свій колір користувача → колір із дизайну → «випадковий», але завжди
// той самий для коду (сума кодів букв), щоб і невідомі предмети були кольоровими
export function paletteOf(code, overrides) {
  if (overrides?.[code]) return overrides[code];
  if (DEFAULT_PALETTE[code]) return DEFAULT_PALETTE[code];
  const sum = [...code].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE_KEYS[sum % PALETTE_KEYS.length];
}

// Класи світлої плашки предмета: fachClasses("Ma", overrides) → "bg-mathe-tint text-mathe-text"
export const fachClasses = (code, overrides) => PALETTES[paletteOf(code, overrides)].tint;

// Унікальний ключ уроку в межах дня (у одного period буває кілька уроків — паралельні курси)
export const lessonKey = (lesson) => `${lesson.period}-${lesson.subject.code}-${lesson.course?.nr ?? ""}`;

// Знайти урок дня за номером і кодом предмета (так його записано в адресі шторки)
export const findLesson = (lessons, period, code) =>
  lessons.find((l) => l.period === Number(period) && (!code || l.subject.code === code)) ?? null;

// Klausur цього уроку (з day.exams за lesson.examId) або null
export const lessonExam = (day, lesson) => (lesson.examId ? day?.exams.find((e) => e.id === lesson.examId) ?? null : null);

// Рядки сітки тижня: усі номери уроків, що є в цих днях, від меншого до більшого.
// Час береться з meta.lessonTimes; в уроку 10 (AG після занять) часу немає.
// Результат: [{ period: 1, start: "07:30", end: "08:15" }, …]
export function periodRows(days, lessonTimes = []) {
  const periods = new Set(days.flatMap((d) => d.lessons.map((l) => l.period))); // номери, що зустрічаються
  return [...periods]
    .sort((a, b) => a - b)
    .map((period) => lessonTimes.find((t) => t.period === period) ?? { period, start: null, end: null });
}

// Скільки уроків зі статусом за тиждень і в які дні: { count: 2, days: ["Di", "Mi"], first: "2026-10-06" }
export function countStatus(days, statuses) {
  const result = { count: 0, days: [], first: null };
  for (const day of days) {
    const n = day.lessons.filter((l) => statuses.includes(l.status)).length;
    if (!n) continue;
    result.count += n;
    result.days.push(day.weekday); // "Mi"
    result.first ??= day.date; // перший такий день
  }
  return result;
}

// «Kommt noch»: майбутні уроки зі змінами (сьогодні після цієї хвилини і далі), по порядку
export function upcomingChanges(days, todayIso) {
  return days
    .filter((d) => d.date >= todayIso && d.status === "ok")
    .flatMap((d) => d.lessons.filter((l) => l.status !== "normal").map((lesson) => ({ date: d.date, weekday: d.weekday, lesson })));
}

// Вихідний день: сервер у тижні віддає тільки Mo–Fr, тому Sa/So складаємо самі (без запитів)
export const weekendDay = (iso) => ({
  date: iso,
  weekday: weekdayShort(iso),
  status: "holiday",
  freeReason: "weekend",
  info: [],
  lessons: [],
  expectedLessons: [],
  exams: [],
});

// Дні для сітки тижня: Mo–Fr із сервера (+ Sa/So, якщо увімкнено «Wochenende anzeigen»)
export const weekDays = (week, showWeekend) =>
  showWeekend ? [...week.days, weekendDay(addDays(week.from, 5)), weekendDay(addDays(week.from, 6))] : week.days;

// Підпис дня без уроків (або null, якщо план є):
//   holiday + weekend → «Wochenende», holiday → «Schulfrei» (назви свята в даних немає),
//   not_published → «Plan fehlt noch», unavailable → «Nicht erreichbar»
export function freeText(day) {
  if (day.status === "holiday") return day.freeReason === "weekend" ? "Wochenende" : "Schulfrei";
  if (day.status === "not_published") return "Plan fehlt noch";
  if (day.status === "unavailable") return "Nicht erreichbar";
  return null;
}

// Понеділок тижня, який показувати «зараз»: у суботу й неділю — вже наступний тиждень (як і сервер)
export const currentMonday = (todayIso) => (isWeekend(todayIso) ? addDays(mondayOf(todayIso), 7) : mondayOf(todayIso));

// Пояснення під уроком (рядок з (i)): тема Klausur, текст школи, перенос або «Zusatzstunde»
export function lessonNote(lesson, exam) {
  if (exam) return `${exam.type}${exam.topic ? ` · ${exam.topic}` : ""}`;
  return lessonCaption(lesson) || movedText(lesson.moved) || (lesson.status === "added" ? "Zusatzstunde" : null);
}
