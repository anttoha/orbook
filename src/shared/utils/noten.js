import { translate } from "../i18n/translate";
import { parseDay, weekdayShort } from "./format";

// ─────────────────────────────────────────────────────────────
// Noten aus Home.InfoPoint (часть 36b): расчёты без React.
// Данные — ответ POST /api/noten/abrufen (docs/API.md «Noten»):
//   { updatedAt, fetchedAt, subjects: [{ code, name, grades: [{ date, grade, value, note, weight, half }], finals }],
//     absences: { days, hours, summary } }
// Многие поля бывают null — поэтому почти везде «?.» и «?? …».
// ─────────────────────────────────────────────────────────────

// 2.14 → «2,1»; null → «–»
export const noteNumber = (value) => (value == null ? "–" : value.toFixed(1).replace(".", ","));

// Цвет оценки (решение владельца): до 2,5 — хорошо, больше 3,5 — плохо, между — нейтрально
export function gradeTone(value) {
  if (value == null) return "none";
  if (value <= 2.5) return "good";
  return value > 3.5 ? "bad" : "mid";
}

// Вес оценки: незнакомое слово InfoPoint (null) считаем ×1
export const weightOf = (grade) => grade?.weight ?? 1;

// «ma» → «Ma» для кружка предмета (так же выглядят коды плана)
export const badgeOf = (code) => (code ? code[0].toUpperCase() + code.slice(1, 3) : "?");

// Оценки предмета в полугодии, новые сверху
export const gradesOf = (subject, half) =>
  (subject?.grades ?? []).filter((g) => g.half === half).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

// Schnitt: Σ оценка×вес / Σ вес, только оценки с числом («m.E.» не считается)
export function averageOf(grades) {
  const counted = grades.filter((g) => g.value != null);
  const weights = counted.reduce((sum, g) => sum + weightOf(g), 0);
  if (weights === 0) return null;
  return counted.reduce((sum, g) => sum + g.value * weightOf(g), 0) / weights;
}

// Полугодие, которое открыть: есть оценки второго — второе
export const defaultHalf = (data) => ((data?.subjects ?? []).some((s) => s.grades?.some((g) => g.half === 2)) ? 2 : 1);

// Обзор полугодия: предметы с оценками, их Schnitt, общий Schnitt (среднее предметов), сколько оценок
export function overviewOf(data, half) {
  const subjects = (data?.subjects ?? [])
    .map((s) => ({ ...s, list: gradesOf(s, half) }))
    .filter((s) => s.list.length > 0)
    .map((s) => ({ ...s, average: averageOf(s.list) }));
  const averages = subjects.map((s) => s.average).filter((v) => v != null);
  return {
    subjects,
    average: averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : null,
    count: subjects.reduce((sum, s) => sum + s.list.length, 0),
  };
}

// Zeugnis: только оценки, которые выставила школа (finals). Предметы без единой — не показываем
export function zeugnisOf(data) {
  return (data?.subjects ?? [])
    .map((s) => {
      const finals = [1, 2].map((half) => s.finals?.find((f) => f.half === half) ?? null);
      const last = [...finals].reverse().find((f) => f?.grade) ?? null;
      return { ...s, finals, last };
    })
    .filter((s) => s.last);
}

// Строка под предметом в Zeugnis: «1. Hj. 2 · 2. Hj. –»
export const finalsLine = (finals) =>
  finals.map((f, i) => translate("{half}. Hj. {grade}", { half: i + 1, grade: f?.grade ?? "–" })).join(" · ");

// ── Notenrechner ──

// Цель по умолчанию: на 0,1 лучше текущего (вниз до 0,1), но не лучше 1,0
export function defaultTarget(average) {
  if (average == null) return 2;
  return Math.max(1, Math.floor(average * 10 + 1e-9) / 10 - 0.1);
}

export const stepTarget = (target, delta) => Math.round(Math.min(6, Math.max(1, target + delta)) * 10) / 10;

// Какую оценку нужно на следующей работе (вес k), чтобы Schnitt стал не хуже цели.
// x = (Ziel·(W+k) − S) / k. Показываем вниз до 0,1 — тогда точно хватит.
// { status: "need", need, after } | { status: "impossible" } (лучше 1 не бывает) | { status: "sure" } (хватит и 6)
export function neededGrade(grades, target, k) {
  const counted = grades.filter((g) => g.value != null);
  const sum = counted.reduce((acc, g) => acc + g.value * weightOf(g), 0);
  const weights = counted.reduce((acc, g) => acc + weightOf(g), 0);
  const x = (target * (weights + k) - sum) / k;
  if (x < 1 - 1e-9) return { status: "impossible" };
  if (x >= 6) return { status: "sure" };
  const need = Math.floor(x * 10 + 1e-9) / 10;
  return { status: "need", need, after: (sum + need * k) / (weights + k) };
}

// Есть ли у предмета оценка ×2 — тогда в Notenrechner сразу «×2»
export const hasDouble = (grades) => grades.some((g) => weightOf(g) >= 2);

// ── «neu» ──

export const gradeKey = (code, g) => [code, g.date, g.grade, g.note].join("|");

// Оценки из нового ответа, которых не было в старом. Первый раз (старого нет) — ничего не «neu»
export function freshKeys(before, after) {
  if (!before) return [];
  const known = new Set((before.subjects ?? []).flatMap((s) => (s.grades ?? []).map((g) => gradeKey(s.code, g))));
  return (after?.subjects ?? []).flatMap((s) => (s.grades ?? []).map((g) => gradeKey(s.code, g))).filter((key) => !known.has(key));
}

// Самая новая оценка: сперва среди «neu», иначе вообще (блок на Start)
export function latestGrade(data, fresh = []) {
  const all = (data?.subjects ?? []).flatMap((s) => (s.grades ?? []).filter((g) => g.grade).map((g) => ({ subject: s, grade: g, fresh: fresh.includes(gradeKey(s.code, g)) })));
  const pool = all.some((x) => x.fresh) ? all.filter((x) => x.fresh) : all;
  return pool.sort((a, b) => (b.grade.date ?? "").localeCompare(a.grade.date ?? ""))[0] ?? null;
}

// ── Fehlzeiten ──

const inHalf = (half) => (entry) => half == null || entry.half === half;

// Числа для плиток: дни, часы, сколько записей без извинения. half null — за весь год
export function absenceStats(absences, half = null) {
  const days = (absences?.days ?? []).filter(inHalf(half));
  const hours = (absences?.hours ?? []).filter(inHalf(half));
  return {
    days: days.length,
    hours: hours.reduce((sum, h) => sum + (h.hours ?? 0), 0),
    unexcused: [...days, ...hours].filter((e) => e.excused === false).length,
  };
}

// Записи списка «Einträge», новые сверху: { key, date, title, sub, excused }
export function absenceEntries(absences, half) {
  const days = (absences?.days ?? []).filter(inHalf(half)).map((d, i) => ({ key: `d${i}`, date: d.date, title: translate("Ganzer Tag"), sub: d.reason, excused: d.excused }));
  const hours = (absences?.hours ?? []).filter(inHalf(half)).map((h, i) => ({
    key: `h${i}`,
    date: h.date,
    title: hoursTitle(h),
    sub: [h.subject, h.reason].filter(Boolean).join(" · ") || null,
    excused: h.excused,
  }));
  return [...days, ...hours].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

function hoursTitle(h) {
  if (h.hours == null) return h.amount || translate("Fehlstunden");
  return h.hours === 1 ? translate("1 Stunde") : translate("{n} Stunden", { n: h.hours });
}

// ── Даты и «Stand» ──

// «2026-09-16» → «16.09.»
export const dotDate = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.` : "");
// «Di 16.09.»
export const dayDate = (iso) => (iso ? `${weekdayShort(iso)} ${dotDate(iso)}` : "");
// Плашка даты: «16» и «SEP»
const MONTH_TAGS = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];
export const monthTag = (iso) => (iso ? translate(MONTH_TAGS[parseDay(iso).getUTCMonth()]) : "");

const clock = (date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
const sameDay = (a, b) => a.toDateString() === b.toDateString();

// «Stand 16.09. · geholt 07:41» (geholt в другой день — дата). updatedAt null — без «Stand»
export function standLine(data, now = new Date()) {
  const parts = [];
  if (data?.updatedAt) parts.push(translate("Stand {date}", { date: dotDate(data.updatedAt) }));
  if (data?.fetchedAt) {
    const at = new Date(data.fetchedAt);
    parts.push(translate("geholt {time}", { time: sameDay(at, now) ? clock(at) : `${String(at.getDate()).padStart(2, "0")}.${String(at.getMonth() + 1).padStart(2, "0")}.` }));
  }
  return parts.join(" · ");
}

// ── Связь с Tests ──

const norm = (text) => (text ?? "").toLowerCase().trim();

// Предмет InfoPoint и предмет плана — один и тот же? Код InfoPoint ≠ Kürzel плана, поэтому
// сравниваем имена («Mathematik» и «Mathe»: одно начинается с другого) и, на всякий случай, код
export function sameSubject(subject, planSubject) {
  if (!subject || !planSubject) return false;
  const a = norm(subject.name);
  const b = norm(planSubject.name);
  if (a && b && (a.startsWith(b) || b.startsWith(a))) return true;
  return norm(subject.code) === norm(planSubject.code);
}

// Оценка за Klausur: в тот же день, тот же предмет
export function examGrade(exam, data) {
  if (!exam?.date) return null;
  for (const subject of data?.subjects ?? []) {
    if (!sameSubject(subject, exam.subject)) continue;
    const grade = subject.grades?.find((g) => g.date === exam.date && g.grade);
    if (grade) return grade;
  }
  return null;
}

// Ближайшая Klausur этого предмета (exams — будущие, по дате)
export const nextExamOf = (exams, subject) => (exams ?? []).find((exam) => exam.daysLeft >= 0 && sameSubject(subject, exam.subject)) ?? null;

// Сколько ждать до следующей загрузки: «wieder in 4 Min.»
export const waitMinutes = (seconds) => Math.max(1, Math.ceil((seconds ?? 60) / 60));
