// ─────────────────────────────────────────────────────────────
// Что показывают блоки «Start» (часть 30c) — чистые функции над данными, которые уже есть
// в сторах (план, Termine, заметки). Компоненты блоков только рисуют результат.
// ─────────────────────────────────────────────────────────────
import { isFree, lastDay } from "./appointments";
import { addDays, isWeekend } from "./format";
import { toMinutes } from "./lessonClock";
import { visibleNotes } from "./notes";

const CHANGED = ["cancelled", "substitution", "moved", "added", "room_change"];

// Ближайший выпавший урок сегодня после этой минуты: «09:25 · Englisch fällt aus» в блоке «Jetzt»
export function nextCancelled(lessons, minutes) {
  return lessons.filter((l) => l.status === "cancelled" && l.start && toMinutes(l.start) > minutes).sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0] ?? null;
}

// «Änderungen»: изменения сегодня и в следующий учебный день (days — дни из загруженных недель).
// → [{ date, lesson }] по порядку дней и уроков
export function changesSoon(days, today, nextDay) {
  return days
    .filter((d) => (d.date === today || d.date === nextDay) && d.status === "ok")
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((d) => d.lessons.filter((l) => CHANGED.includes(l.status)).map((lesson) => ({ date: d.date, lesson })));
}

// Учебные дни от завтра до дня before (не включая): без выходных и свободных дней школы
export function schoolDaysUntil(today, before, holidays = []) {
  const free = new Set(holidays);
  let count = 0;
  for (let day = addDays(today, 1); day < before && count < 400; day = addDays(day, 1)) {
    if (!isWeekend(day) && !free.has(day)) count += 1;
  }
  return count;
}

// «Countdown»: ближайшие каникулы из Termine вида «Frei».
// → null (ничего не внесено) | { item, running: true } (каникулы идут) | { item, days, progress }
// progress (0…1) — сколько прошло от конца прошлых каникул; нет прошлых в списке — null
export function holidayCountdown(items, today, holidays = []) {
  const free = items.filter(isFree).sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  const running = free.find((item) => item.dateFrom <= today && today <= lastDay(item));
  if (running) return { item: running, running: true };
  const next = free.find((item) => item.dateFrom > today);
  if (!next) return null;
  const days = schoolDaysUntil(today, next.dateFrom, holidays);
  const before = free.filter((item) => lastDay(item) < today).at(-1);
  const total = before ? schoolDaysUntil(lastDay(before), next.dateFrom, holidays) : 0;
  return { item: next, days, progress: total > 0 ? 1 - days / total : null };
}

// «Notizen»: последние изменённые, без удалённых и пустых
export const latestNotes = (notes, count) =>
  visibleNotes(notes)
    .filter((n) => n.text?.trim())
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .slice(0, count);

// «Materialien»: новые сверху (по createdAt; без даты — в конце)
export const latestMaterials = (items, count) => [...items].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")).slice(0, count);
