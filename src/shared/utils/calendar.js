// ─────────────────────────────────────────────────────────────
// calendar.js — місяці для календарів («Woche wählen», календар Klausuren).
// Місяць — рядок його першого числа: "2026-10-01".
// ─────────────────────────────────────────────────────────────
import { addDays, mondayOf } from "./format";

// "2026-10-07" → "2026-10-01"
export const firstOfMonth = (iso) => `${iso.slice(0, 7)}-01`;

// На n місяців уперед (або назад, якщо n < 0). JS сам переносить рік
export const shiftMonth = (first, n) => {
  const d = new Date(`${first}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
};

// Останній день місяця: день перед першим числом наступного
export const lastOfMonth = (first) => addDays(shiftMonth(first, 1), -1);

// Понеділки рядків календаря: від тижня з 1-м числом до тижня з останнім
export function monthWeeks(first) {
  const last = lastOfMonth(first);
  const weeks = [];
  for (let monday = mondayOf(first); monday <= last; monday = addDays(monday, 7)) weeks.push(monday);
  return weeks;
}
