// ─────────────────────────────────────────────────────────────
// calendarFeed.js — чистые функции Kalender-Abo (часть 40): тело запроса, ссылки календарей, подписи.
// ─────────────────────────────────────────────────────────────
import { translate } from "../i18n/translate";

export const DEFAULT_ITEMS = { lessons: true, exams: true, appointments: true };

// Переключатели «Im Kalender» (немецкий текст — ключ перевода)
export const FEED_ITEMS = [
  { key: "lessons", title: "Stunden", hint: "Mit Raum, Ausfall und Vertretung" },
  { key: "exams", title: "Tests und Klausuren", hint: "Ganztägig am Tag des Tests" },
  { key: "appointments", title: "Termine", hint: "Ausflüge, Elternabend, Ferien" },
];

// Тело PUT /api/calendar-feed. «Meine Kurse» — как у виджета: picked ([] — все Wahl-курсы)
// и скрытые обязательные; «Ganze Klasse» — оба null
export function feedBody(items, mine, picked, hidden) {
  return {
    items: { ...DEFAULT_ITEMS, ...items },
    courses: mine ? [...(picked ?? [])] : null,
    hidden: mine ? [...(hidden ?? [])] : null,
  };
}

// Куда ведёт «Zum Kalender». null — ссылки нет (ключ сервера сменили → только «Link erneuern»)
export function calendarLinks(feed) {
  if (!feed?.url || !feed?.webcalUrl) return null;
  return {
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feed.webcalUrl)}`,
    apple: feed.webcalUrl,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feed.url)}&name=ORBook`,
    copy: feed.url,
  };
}

// «Vom Kalender abgerufen: heute 06:40» / «gestern 18:00» / «Mo 06:30» / «12.11.»; null — ещё ни разу
const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export function fetchedLabel(iso, now = new Date()) {
  const at = iso ? new Date(iso) : null;
  if (!at || Number.isNaN(at.getTime())) return translate("Noch nicht abgerufen");
  const time = at.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((dayStart(now) - dayStart(at)) / 86400000);
  let when = at.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  if (days === 0) when = translate("heute {time}", { time });
  else if (days === 1) when = translate("gestern {time}", { time });
  else if (days < 7) when = `${translate(DAYS[at.getDay()])} ${time}`;
  return translate("Vom Kalender abgerufen: {when}", { when });
}

// Понятный текст ошибки для тоста
export function feedErrorText(error) {
  if (error?.code === "offline" || error?.status === 0) return translate("Nicht gespeichert – keine Verbindung");
  if (error?.status === 429) return translate("Zu viele Änderungen – gleich nochmal");
  return translate("Hat nicht geklappt – bitte nochmal");
}
