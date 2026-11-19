// ─────────────────────────────────────────────────────────────
// share.js — кнопка «Teilen» (з гайду orbook-be, docs/frontend/03-plan.md).
// Текст про день/тиждень готує СЕРВЕР (GET /api/share), відправляє система телефону.
// ─────────────────────────────────────────────────────────────
import { toast } from "sonner";
import { api } from "../api/api";
import { lessonName, numericDate, subjectName, weekdayShort } from "./format";
import { translate } from "../i18n/translate";

// range: "today" | "tomorrow" | "week"; include: ["substitutions", "cancellations", "roomChanges", "exams"]
export async function loadShareText(range, { date, include } = {}) {
  const query = new URLSearchParams({ range });
  if (date) query.set("date", date); // від якого дня рахувати (за замовчуванням — сьогодні)
  if (include?.length) query.set("include", include.join(","));
  const { text } = await api(`/share?${query}`);
  return text;
}

// Посилання, що відкриває WhatsApp (на ПК — WhatsApp Web) з готовим текстом
export const whatsappUrl = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

// Скопіювати текст у буфер обміну + сповіщення
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Kopiert");
  } catch {
    toast.error(translate("Kopieren nicht möglich")); // браузер заборонив доступ до буфера
  }
}

// Системне меню «Teilen» (телефон); якщо його немає (ПК) — копіюємо текст
export async function shareText(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // людина закрила меню — це не помилка
    }
  }
  await copyText(text);
}

// Текст про Klausur (кнопка «Teilen» у її вікні) — готується на пристрої, без імен
export function examText(exam) {
  const [, month, day] = exam.date.split("-");
  const lesson = exam.lesson ? translate(", {lesson}. Std", { lesson: exam.lesson }) : "";
  const topic = exam.topic ? `\n${exam.topic}` : "";
  return `${exam.type} ${subjectName(exam.subject)} am ${day}.${month}.${lesson}${topic}\n\nvia ORBook`;
}

// Текст про одну Hausaufgabe (кнопка «Teilen» у її вікні). Без автора: учням потрібне саме завдання
export function homeworkText(item) {
  const [, month, day] = item.due.split("-");
  return translate("Hausaufgabe {v1} bis {day}.{month}.\n{v4}\n\nvia ORBook", { v1: subjectName(item.subject), day, month, v4: item.text ?? "" });
}

// Текст про один урок (кнопка «Teilen» у шторці уроку і в меню) — готується на пристрої.
// Без імен — лише предмет, час, кабінет і що змінилось.
export function lessonText(lesson, dateIso) {
  const time = lesson.start ? ` (${lesson.start}–${lesson.end})` : "";
  const lines = [translate("{v1}, {v2} · {period}. Std {v4}{time}", { v1: weekdayShort(dateIso), v2: numericDate(dateIso), period: lesson.period, v4: lessonName(lesson), time })];
  if (lesson.status === "cancelled") lines.push(translate("Fällt aus"));
  else if (lesson.status === "room_change") lines.push(translate("Raumänderung: Raum {room}", { room: lesson.room }));
  else if (lesson.status !== "normal") lines.push(translate("Vertretung{v1}", { v1: lesson.room ? translate(", Raum {room}", { room: lesson.room }) : "" }));
  else if (lesson.room) lines.push(translate("Raum {room}", { room: lesson.room }));
  lines.push("", "via ORBook");
  return lines.join("\n");
}
