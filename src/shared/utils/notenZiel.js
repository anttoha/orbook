import { averageOf, neededGrade } from "./noten";

// ─────────────────────────────────────────────────────────────
// Notenziel + Verlauf (часть 42): расчёты без React.
// Цели: { "1:ma": { ziel: 2, k: 2 }, "1:*": { ziel: 2 } } — ключ «полугодие:предмет», «*» — общий Schnitt.
// ─────────────────────────────────────────────────────────────

export const ALL = "*";
export const zielKey = (half, code) => `${half}:${code}`;

// Статус цели по нужной оценке (neededGrade) и текущему Schnitt.
// erreichbar — хватит оценки не лучше своего Schnitt; knapp — лучше, но не больше чем на 0,7; schwer — ещё лучше или нельзя
const KNAPP = 0.7;
export function zielStatus(result, average) {
  if (average == null) return null;
  if (result.status === "sure") return "erreichbar";
  if (result.status === "impossible") return "schwer";
  if (result.need >= average - 1e-9) return "erreichbar";
  return average - result.need <= KNAPP + 1e-9 ? "knapp" : "schwer";
}

// Всё про цель предмета: что нужно и статус. goal — { ziel, k } или undefined
export function zielInfo(grades, goal) {
  if (!goal) return null;
  const average = averageOf(grades);
  if (average == null) return { ziel: goal.ziel, result: null, status: null };
  const result = neededGrade(grades, goal.ziel, goal.k ?? 1);
  return { ziel: goal.ziel, result, status: zielStatus(result, average) };
}

// Оценки, которые годятся для графика: есть дата и число
const dated = (grades) => grades.filter((g) => g.date && g.value != null);
const daysOf = (grades) => [...new Set(dated(grades).map((g) => g.date))].sort();

// Ход Schnitt предмета: [{ date, value }] — точка на каждый день с оценкой, Schnitt всех оценок до этого дня
export function zielSeries(grades) {
  const list = dated(grades);
  return daysOf(list).map((date) => ({ date, value: averageOf(list.filter((g) => g.date <= date)) }));
}

// Общий ход: на каждый день — среднее Schnitt предметов, у которых к этому дню уже есть оценка
export function allSeries(subjects) {
  const days = daysOf(subjects.flatMap((s) => s.list ?? []));
  return days.map((date) => {
    const averages = subjects.map((s) => averageOf(dated(s.list ?? []).filter((g) => g.date <= date))).filter((v) => v != null);
    return { date, value: averages.reduce((a, b) => a + b, 0) / averages.length };
  });
}

// Низ шкалы графика (1 — сверху): не меньше 3, вмещает худшую точку и цель, не больше 6
export function scaleBottom(points, ziel) {
  const worst = Math.max(...points.map((p) => p.value), ziel ?? 1);
  return Math.min(6, Math.max(3, Math.ceil(worst - 1e-9)));
}
