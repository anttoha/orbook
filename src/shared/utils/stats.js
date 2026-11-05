// ─────────────────────────────────────────────────────────────
// stats.js — підписи і розрахунки для екрана Statistik (GET /api/stats, docs/API.md → «Statistik»).
// Без React, тому легко тестувати.
// ─────────────────────────────────────────────────────────────
import { isoWeek, longDate, monthLong, shortDate } from "./format";

// Адреса запиту. picked — «Meine Kurse»: [] — рахувати всі уроки, інакше тільки вибрані курси.
// NO_OPTIONAL («keine») іде як є: сервер такого курсу не знає і рахує лише обов'язкові уроки
export function statsPath(range, picked = []) {
  const courses = picked.length ? `&courses=${picked.map(encodeURIComponent).join(",")}` : "";
  return `/stats?range=${range}${courses}`;
}

// «Vertretungen» рахуємо так само, як рядок під тижнем: заміна + перенесений + доданий урок
export const changedCount = (totals) => (totals?.substitutions ?? 0) + (totals?.moved ?? 0) + (totals?.added ?? 0);

// «9b · September» або «9b · KW 45»
export function statsEyebrow(className, data) {
  const from = data?.period?.from;
  const period = from ? (data.range === "week" ? `KW ${isoWeek(from)}` : monthLong(from)) : null;
  return [className, period].filter(Boolean).join(" · ");
}

// Порівняння з минулим періодом: { text: "+3 ggü. Aug", tone: "up" | "down" | "same" } або null.
// Без даних за минулий період порівнювати нема з чим
export function compareWith(now, before, data) {
  const previous = data?.previous;
  if (!previous?.daysCounted) return null;
  const diff = now - before;
  const label = data.range === "week" ? `KW ${isoWeek(previous.from)}` : shortMonth(previous.from); // «KW 37» коротше за «Vorwoche» і влазить в один рядок
  if (diff === 0) return { text: `±0 ggü. ${label}`, tone: "same" };
  // справжній мінус «−», як у дизайні, а не дефіс
  return { text: `${diff > 0 ? "+" : "−"}${Math.abs(diff)} ggü. ${label}`, tone: diff > 0 ? "up" : "down" };
}

// «Aug» з "2026-08-01": беремо місяць із короткої дати «1. Aug»
const shortMonth = (iso) => shortDate(iso).split(" ")[1];

// «bis 30. Sept» під числом Klausuren
export const untilText = (data) => (data?.period?.to ? `bis ${shortDate(data.period.to)}` : "");

// Текст екрана «Noch zu wenig Daten». Без trackingSince — без дати
export function tooLittleText(trackingSince) {
  const base = "Die Statistik füllt sich, sobald ORBook ein paar Schultage mitgeschrieben hat.";
  return trackingSince ? `${base} Gezählt wird ab ${longDate(trackingSince)}.` : base;
}

// Стовпчики «Diese Woche nach Tag»: висоти у відсотках від найвищого дня.
// cancelled — сірий низ, substitutions — фіолетовий верх
export function weekdayBars(byWeekday) {
  const days = byWeekday ?? [];
  const max = Math.max(1, ...days.map((d) => (d.cancelled ?? 0) + (d.substitutions ?? 0)));
  return days.map((d) => ({
    weekday: d.weekday,
    cancelled: d.cancelled ?? 0,
    substitutions: d.substitutions ?? 0,
    cancelledPct: ((d.cancelled ?? 0) / max) * 100,
    substitutionsPct: ((d.substitutions ?? 0) / max) * 100,
  }));
}

// Рядки списків «Fällt am häufigsten aus» і «Klausuren nach Fach»: { subject, value, pct }.
// pct — довжина смужки від найбільшого значення в списку
export function barRows(items, valueKey) {
  const list = items ?? [];
  const max = Math.max(1, ...list.map((item) => item[valueKey] ?? 0));
  return list.map((item) => ({ subject: item.subject, value: item[valueKey] ?? 0, pct: ((item[valueKey] ?? 0) / max) * 100 }));
}
