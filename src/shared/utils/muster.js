// ─────────────────────────────────────────────────────────────
// muster.js — Muster-Stundenplan (частина 19).
//
// Якщо школа ще не виклала план дня, сервер дає expectedLessons — звичайні уроки цього дня тижня
// (того ж тижня A/B) з минулих тижнів. Фронт показує їх як «Muster»: заштриховано і з міткою.
// Тут — чисті функції: перетворити такі дні, буква тижня A/B, що перевірити, коли прийшов справжній план.
// ─────────────────────────────────────────────────────────────
import { daysBetween } from "./format";

// Номер тижня циклу школи → буква: 1 → «A», 2 → «B», невідомо → null (тоді букву не показуємо)
export const abLetter = (week) => (week === 1 ? "A" : week === 2 ? "B" : null);

// Чи це день із Muster: плану ще немає, а звичайні уроки є
export const isMusterSource = (day) => (day?.status === "not_published" || day?.status === "unavailable") && day.expectedLessons?.length > 0;

// День без плану → «звичайний» день з уроками з Muster. Так сітка, список і вікно уроку працюють як завжди,
// а мітку і штриховку малюють за прапорцем muster (у дня і в кожного уроку)
export function withMuster(day) {
  if (!isMusterSource(day)) return day;
  return { ...day, status: "ok", muster: true, lessons: day.expectedLessons.map((lesson) => ({ ...lesson, muster: true })) };
}

// Відповідь GET /api/week з Muster-днями (null лишається null)
export const musterWeek = (data) => (data ? { ...data, days: data.days.map(withMuster) } : data);

// Чи весь тиждень — Muster (вільні дні не рахуємо): тоді мітка MUSTER у заголовку
export function isMusterWeek(days) {
  const school = (days ?? []).filter((day) => day.status !== "holiday");
  return school.length > 0 && school.every((day) => day.muster);
}

// Muster-дні тижня, коли тиждень змішаний (частина днів уже з планом): «Fr» або «Do, Fr»
export const musterDays = (days) => (isMusterWeek(days) ? [] : (days ?? []).filter((day) => day.muster).map((day) => day.weekday));

// Буква тижня для будь-якого понеділка: від поточного тижня (meta.abWeek) тижні чергуються.
// Календар «Woche wählen» і заголовок тижня, поки той ще вантажиться
export function abForMonday(monday, currentMonday, currentWeek) {
  if (!abLetter(currentWeek) || !monday || !currentMonday) return null;
  const shift = Math.round(daysBetween(currentMonday, monday) / 7);
  return abLetter(shift % 2 === 0 ? currentWeek : 3 - currentWeek);
}

// Тиждень порожній, бо Muster ще не з чого зібрати (початок року): плану немає, Muster увімкнено, а уроків нема.
// musterUntil — з /api/meta (null — адмін вимкнув Muster, тоді звичайна підказка «Noch kein Plan»)
export function noMusterYet(days, musterUntil, today) {
  if (!musterUntil) return false;
  const open = (days ?? []).filter((day) => day.status !== "holiday");
  return open.length > 0 && open.every((day) => day.status === "not_published" && !day.expectedLessons?.length && day.date >= today && day.date <= musterUntil);
}

// Чи стоїть цей предмет у цьому уроці і не скасований
const takesPlace = (lessons, period, code) => lessons.some((l) => l.period === period && l.subject?.code === code && l.status !== "cancelled");

// Інший урок того ж предмета в цей день (куди перенести нотатку) або null
const otherPeriod = (lessons, period, code) => lessons.find((l) => l.period !== period && l.subject?.code === code && l.status !== "cancelled")?.period ?? null;

// Ключ для «So lassen»: те саме рішення не питаємо вдруге
export const checkKey = (item) => (item.kind === "exam" ? `exam:${item.exam.id}:${item.exam.date}:${item.exam.lesson}` : `note:${item.note.id}`);

// Що перевірити, коли прийшов справжній план (сам день — уже не Muster):
//   Klausur/Test на уроці, якого немає або він скасований → { kind: "exam", exam }
//   нотатка до уроку, якого немає → { kind: "note", note, target } (target — інший урок того ж предмета або null)
// dismissed — ключі «So lassen». Минулі дні не перевіряємо: там уже нічого не змінити
export function planChecks(day, notes, dismissed = [], today = "") {
  if (!day || day.status !== "ok" || day.muster || day.date < today) return [];
  const lessons = day.lessons ?? [];
  const skip = new Set(dismissed);
  const exams = (day.exams ?? [])
    .filter((exam) => exam.lesson != null && exam.subject?.code && !takesPlace(lessons, exam.lesson, exam.subject.code))
    .map((exam) => ({ kind: "exam", exam }));
  const own = (notes ?? [])
    .filter((note) => !note.deleted && note.date === day.date && note.period && note.subject && !takesPlace(lessons, note.period, note.subject))
    .map((note) => ({ kind: "note", note, target: otherPeriod(lessons, note.period, note.subject) }));
  return [...own, ...exams].filter((item) => !skip.has(checkKey(item)));
}

// Що каже справжній план про урок: «Englisch in der 6. Stunde» / «Mathe fällt aus» / «Mathe steht nicht mehr im Plan»
export function checkReason(item, lessons, subjectLabel) {
  const period = item.kind === "exam" ? item.exam.lesson : item.note.period;
  const code = item.kind === "exam" ? item.exam.subject?.code : item.note.subject;
  if (item.kind === "note" && item.target) return `${subjectLabel} in der ${item.target}. Stunde.`;
  const cancelled = lessons.some((l) => l.period === period && l.subject?.code === code && l.status === "cancelled");
  return cancelled ? `${subjectLabel} fällt aus.` : `${subjectLabel} steht nicht mehr in der ${period}. Stunde.`;
}
