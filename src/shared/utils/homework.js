// ─────────────────────────────────────────────────────────────
// homework.js — Hausaufgaben і записи вчителів без React (частина 14, docs/API.md «Hausaufgaben»).
// Тут: групи списку, перевірка тексту, підписи «von Mü», «Ändern: …» і рядки «Verlauf».
// Сервер перевіряє те саме і відповість 422 — тут лише щоб показати помилку до відправки.
// ─────────────────────────────────────────────────────────────
import { addDays, mondayOf, numericDate, weekdayLong, weekdayShort } from "./format";

export const TEXT_MAX = 300;

// Текст завдання: кілька рядків можна, контактів і посилань — ні (як clean_text на сервері)
export function validateHomeworkText(value) {
  const text = (value ?? "").trim();
  if (!text) return "Bitte die Aufgabe eintragen.";
  if (text.length > TEXT_MAX) return `Die Aufgabe darf höchstens ${TEXT_MAX} Zeichen lang sein.`;
  // eslint-disable-next-line no-control-regex -- шукаємо саме керівні символи, крім переносу рядка
  if (/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/.test(text)) return "Die Aufgabe enthält ungültige Zeichen.";
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)) return "Bitte keine E-Mail-Adressen in der Aufgabe.";
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:de|com|net|org|eu|io|app|info|ru|me|ly)\b)/i.test(text)) return "Bitte keine Links in der Aufgabe.";
  for (const run of text.match(/[+\d][\d\s/()-]*/g) ?? []) {
    if ((run.match(/\d/g) ?? []).length >= 9) return "Bitte keine Telefonnummern in der Aufgabe.";
  }
  return null;
}

// Запис → поля форми і назад
export const homeworkToForm = (item) => ({ subject: item?.subject?.code ?? null, due: item?.due ?? "", text: item?.text ?? "", studentsMayEdit: item?.studentsMayEdit ?? false });

// «Bis morgen» / «Diese Woche» / «Nächste Woche» / «Später». Порожні групи не показуємо
export function groupHomework(items, today) {
  const tomorrow = addDays(today, 1);
  const nextMonday = addDays(mondayOf(today), 7);
  const afterNext = addDays(nextMonday, 7);
  const groups = [
    { title: "Bis morgen", items: items.filter((item) => item.due <= tomorrow) },
    { title: "Diese Woche", items: items.filter((item) => item.due > tomorrow && item.due < nextMonday) },
    { title: "Nächste Woche", items: items.filter((item) => item.due > tomorrow && item.due >= nextMonday && item.due < afterNext) },
    { title: "Später", items: items.filter((item) => item.due > tomorrow && item.due >= afterNext) },
  ];
  return groups.filter((group) => group.items.length > 0);
}

// «von Mü» у рядку списку. Записи учнів — без автора (null)
export const authorShort = (entry) => entry?.author?.short ?? null;

// Хто може міняти запис (плашка у вікні). Запис учня — null: там стара плашка «ohne Namen»
export function editRightsText(entry) {
  const short = authorShort(entry);
  if (!short) return null;
  return entry.studentsMayEdit ? `Ändern: ${short}, Admin und Schüler mit Freigabe.` : `Ändern dürfen nur ${short} und der Admin.`;
}

// «Eingetragen von Mü · Lehrkraft» або «… von Ihnen (Mü)», якщо дивиться сам учитель.
// changedByStudent — «· geändert von Schüler» (останню зміну зробив учень з Freigabe)
export function authorLine(entry, me) {
  const short = authorShort(entry);
  if (!short) return null;
  const mine = me?.teacher?.short === short;
  return { name: mine ? `Ihnen (${short})` : short, role: mine ? null : "Lehrkraft", changedByStudent: entry.lastChange?.by === "student" };
}

// «Bis morgen, Do 18.9.» — заголовок вікна Hausaufgabe
export function dueTitle(due, today) {
  const date = `${weekdayShort(due)} ${numericDate(due)}`;
  if (due === today) return `Bis heute, ${date}`;
  if (due === addDays(today, 1)) return `Bis morgen, ${date}`;
  return `Bis ${date}`;
}

// ── Verlauf ──

// Хто змінив: учитель — Kürzel, учень — без імені
export function changeActor(change) {
  if (change.by === "teacher") return change.short ?? "Lehrkraft";
  return { student: "Schüler mit Freigabe", class: "Klasse", admin: "Admin" }[change.by] ?? "Unbekannt";
}

// «Mi 15:15»: дати в API вже в часі школи, тому беремо з рядка
export const changeTime = (at) => (at ? `${weekdayShort(at.slice(0, 10))} ${at.slice(11, 16)}` : "");

const shortDay = (iso) => (iso ? `${weekdayShort(iso)} ${numericDate(iso)}` : "—");
const quoted = (text) => (text ? `„${text.length > 40 ? `${text.slice(0, 39)}…` : text}“` : "—");
const FIELD_TEXT = {
  due: (v) => `Abgabe: ${shortDay(v.old)} → ${shortDay(v.new)}`,
  date: (v) => `Datum: ${shortDay(v.old)} → ${shortDay(v.new)}`,
  lesson: (v) => `Stunde: ${v.old ?? "—"} → ${v.new ?? "—"}`,
  type: (v) => `Art: ${v.old} → ${v.new}`,
  subject: (v) => `Fach: ${v.old?.code ?? v.old ?? "—"} → ${v.new?.code ?? v.new ?? "—"}`,
  topic: (v) => `Thema: ${quoted(v.old)} → ${quoted(v.new)}`,
  text: () => "Text geändert",
  studentsMayEdit: (v) => (v.new ? "Schüler dürfen ändern" : "Schüler dürfen nicht mehr ändern"),
};

// Другий рядок у «Verlauf»: що сталося
export function changeText(change) {
  if (change.action === "created") return "Eingetragen";
  if (change.action === "deleted") return "Gelöscht";
  if (change.action === "restored") return "Wiederhergestellt";
  const parts = Object.entries(change.changes ?? {}).map(([field, value]) => FIELD_TEXT[field]?.(value ?? {}) ?? `${field} geändert`);
  return parts.length > 0 ? parts.join(" · ") : "Geändert";
}

// ── Форма ──

// «Nächste Stunde · Do»: перший урок предмета ПІСЛЯ сьогодні в завантажених днях. days — дні з /api/week.
// Скасовані уроки не рахуємо. Немає — null (чип не показуємо)
export function nextLessonDate(days, code, today) {
  if (!code) return null;
  const dates = days
    .filter((day) => day.date > today && day.lessons?.some((lesson) => lesson.subject?.code === code && lesson.status !== "cancelled"))
    .map((day) => day.date)
    .sort();
  return dates[0] ?? null;
}

// Підпис під датою: «Donnerstag · morgen» або просто «Donnerstag»
export function dueHint(due, today) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due ?? "")) return null;
  const word = { [today]: "heute", [addDays(today, 1)]: "morgen" }[due];
  return word ? `${weekdayLong(due)} · ${word}` : weekdayLong(due);
}

// Помилки форми за полями: { subject, due, text }. Дата — ті самі межі, що в Klausur (validateExamDate).
// Стару дату при правці не перевіряємо, як і в Klausur
export function validateHomeworkForm(form, today, validateDate, originalDue = null) {
  const errors = {};
  if (!form.subject) errors.subject = "Bitte ein Fach wählen.";
  const dateError = form.due === originalDue ? null : validateDate(form.due, today);
  if (dateError) errors.due = dateError.message;
  const textError = validateHomeworkText(form.text);
  if (textError) errors.text = textError;
  return errors;
}
