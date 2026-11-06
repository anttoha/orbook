// ─────────────────────────────────────────────────────────────
// stats.js — підписи і розрахунки для екрана Statistik (GET /api/stats, docs/API.md → «Statistik»).
// Без React, тому легко тестувати.
// ─────────────────────────────────────────────────────────────
import { isoWeek, longDate, monthLong, shortDate } from "./format";

// Адреса запиту. picked — «Meine Kurse»: [] — рахувати всі уроки, інакше тільки вибрані курси.
// NO_OPTIONAL («keine») іде як є: сервер такого курсу не знає і рахує лише обов'язкові уроки
// hiddenRequired — приховані обов'язкові курси: їх сервер не рахує (параметр hidden)
const listParam = (name, list) => (list.length ? `&${name}=${list.map(encodeURIComponent).join(",")}` : "");
export function statsPath(range, picked = [], hiddenRequired = []) {
  return `/stats?range=${range}${listParam("courses", picked)}${listParam("hidden", hiddenRequired)}`;
}

// «Vertretungen» рахуємо так само, як рядок під тижнем: заміна + перенесений + доданий урок
export const changedCount = (totals) => (totals?.substitutions ?? 0) + (totals?.moved ?? 0) + (totals?.added ?? 0);

// Назва періоду: «KW 45», «September» або «April–September» (Halbjahr)
function periodName(range, period) {
  if (range === "week") return `KW ${isoWeek(period.from)}`;
  if (range === "halfyear" && period.to) return `${monthLong(period.from)}–${monthLong(period.to)}`;
  return monthLong(period.from);
}

// «9b · September», «9b · KW 45» або «9b · April–September»
export function statsEyebrow(className, data) {
  const period = data?.period?.from ? periodName(data.range, data.period) : null;
  return [className, period].filter(Boolean).join(" · ");
}

// З чим порівнюємо: «KW 37» (коротше за «Vorwoche»), «Aug» на телефоні / «August» на ПК, «Vorhalbjahr»
function previousLabel(range, from, long) {
  if (range === "week") return `KW ${isoWeek(from)}`;
  if (range === "halfyear") return "Vorhalbjahr";
  return long ? monthLong(from) : shortMonth(from);
}

// Порівняння з минулим періодом: { text: "+3 ggü. Aug", tone: "up" | "down" | "same" } або null.
// Без даних за минулий період порівнювати нема з чим. long — повна назва місяця (ПК, картки ширші)
export function compareWith(now, before, data, { long = false } = {}) {
  const previous = data?.previous;
  if (!previous?.daysCounted) return null;
  const diff = now - before;
  const label = previousLabel(data.range, previous.from, long);
  if (diff === 0) return { text: `±0 ggü. ${label}`, tone: "same" };
  // справжній мінус «−», як у дизайні, а не дефіс
  return { text: `${diff > 0 ? "+" : "−"}${Math.abs(diff)} ggü. ${label}`, tone: diff > 0 ? "up" : "down" };
}

// «Aug» з "2026-08-01": беремо місяць із короткої дати «1. Aug»
const shortMonth = (iso) => shortDate(iso).split(" ")[1];

// «bis 30. Sept» під числом Klausuren (на ПК — «bis 30. September»)
export function untilText(data, { long = false } = {}) {
  const to = data?.period?.to;
  if (!to) return "";
  return `bis ${long ? longDate(to) : shortDate(to)}`;
}

// «6 %» — частка уроків, що випали (cancelRate 0…1). Нема даних — «0 %»
export const cancelRateText = (rate) => `${Math.round((rate ?? 0) * 100)} %`;

// «von 186 Stunden» під часткою
export const lessonsText = (lessons) => `von ${lessons ?? 0} ${lessons === 1 ? "Stunde" : "Stunden"}`;

// Заголовок графіка по тижнях: «September nach Woche» або «Halbjahr nach Woche»
export const byWeekTitle = (data) => `${data.range === "halfyear" ? "Halbjahr" : monthLong(data.period.from)} nach Woche`;

// Текст екрана «Noch zu wenig Daten». Без trackingSince — без дати
export function tooLittleText(trackingSince) {
  const base = "Die Statistik füllt sich, sobald ORBook ein paar Schultage mitgeschrieben hat.";
  return trackingSince ? `${base} Gezählt wird ab ${longDate(trackingSince)}.` : base;
}

// Двоколірні стовпчики: cancelled — сірий низ, substitutions — фіолетовий верх.
// Висоти у відсотках від найвищого стовпчика; label — підпис під ним, total — число над ним
export function stackedBars(items, labelOf) {
  const list = items ?? [];
  const max = Math.max(1, ...list.map((d) => (d.cancelled ?? 0) + (d.substitutions ?? 0)));
  return list.map((d) => {
    const cancelled = d.cancelled ?? 0;
    const substitutions = d.substitutions ?? 0;
    return { label: labelOf(d), cancelled, substitutions, total: cancelled + substitutions, cancelledPct: (cancelled / max) * 100, substitutionsPct: (substitutions / max) * 100 };
  });
}

// «Diese Woche nach Tag»: Mo–Fr
export const weekdayBars = (byWeekday) => stackedBars(byWeekday, (d) => d.weekday);

// «September nach Woche»: KW 36, KW 37 … (ПК)
export const weekBars = (byWeek) => stackedBars(byWeek, (w) => `KW ${isoWeek(w.from)}`);

// «Ausfall nach Stunde»: один колір, висота від найбільшого числа відмін (ПК)
export function periodBars(byPeriod) {
  const list = byPeriod ?? [];
  const max = Math.max(1, ...list.map((p) => p.cancelled ?? 0));
  return list.map((p) => ({ label: `${p.period}.`, value: p.cancelled ?? 0, pct: ((p.cancelled ?? 0) / max) * 100 }));
}

// Рядки списків «Fällt am häufigsten aus» і «Klausuren nach Fach»: { subject, value, pct }.
// pct — довжина смужки від найбільшого значення в списку
export function barRows(items, valueKey) {
  const list = items ?? [];
  const max = Math.max(1, ...list.map((item) => item[valueKey] ?? 0));
  return list.map((item) => ({ subject: item.subject, value: item[valueKey] ?? 0, pct: ((item[valueKey] ?? 0) / max) * 100 }));
}
