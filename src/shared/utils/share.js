// ─────────────────────────────────────────────────────────────
// share.js — кнопка «Teilen» (з гайду orbook-be, docs/frontend/03-plan.md).
// Текст про день/тиждень готує СЕРВЕР (GET /api/share), відправляє система телефону.
// ─────────────────────────────────────────────────────────────
import { toast } from "sonner";
import { api } from "../api/api";
import { numericDate, subjectName, weekdayShort } from "./format";

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
    toast.error("Kopieren nicht möglich"); // браузер заборонив доступ до буфера
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

// Текст про один урок (кнопка «Teilen» у шторці уроку і в меню) — готується на пристрої.
// Без імен — лише предмет, час, кабінет і що змінилось.
export function lessonText(lesson, dateIso) {
  const time = lesson.start ? ` (${lesson.start}–${lesson.end})` : "";
  const lines = [`${weekdayShort(dateIso)}, ${numericDate(dateIso)} · ${lesson.period}. Std ${subjectName(lesson.subject)}${time}`];
  if (lesson.status === "cancelled") lines.push("Fällt aus");
  else if (lesson.status === "room_change") lines.push(`Raumänderung: Raum ${lesson.room}`);
  else if (lesson.status !== "normal") lines.push(`Vertretung${lesson.room ? `, Raum ${lesson.room}` : ""}`);
  else if (lesson.room) lines.push(`Raum ${lesson.room}`);
  lines.push("", "via ORBook");
  return lines.join("\n");
}
