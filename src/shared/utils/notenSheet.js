// ─────────────────────────────────────────────────────────────
// notenSheet.js — что напечатать на листе A4 «Als PDF» (часть 37, макеты a4-01…03).
// Только из данных на устройстве (последний ответ InfoPoint), без сервера.
// ─────────────────────────────────────────────────────────────
import { translate } from "../i18n/translate";
import { absenceEntries, absenceStats, averageOf, gradesOf, zeugnisOf } from "./noten";

// Есть ли что печатать: хоть одна оценка, Endnote или пропуск
export function hasSheet(data) {
  const subjects = data?.subjects ?? [];
  const absences = (data?.absences?.days?.length ?? 0) + (data?.absences?.hours?.length ?? 0);
  return subjects.some((s) => s.grades?.length || s.finals?.some((f) => f?.grade)) || absences > 0;
}

// Учебный год по дате: с августа — новый. «2026-11-21» → «2026/27». Без даты — null
export function schoolYear(iso) {
  if (!iso) return null;
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const start = month >= 8 ? year : year - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

// «16.11.2026» из «2026-11-16»
const fullDate = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : null);

// Строка под заголовком листа: «Stand 16.11.2026 · aus Home.InfoPoint» (нет даты школы — дата загрузки)
export function paperStand(data) {
  const date = fullDate(data?.updatedAt ?? data?.fetchedAt?.slice(0, 10) ?? null);
  return [date ? translate("Stand {date}", { date }) : null, translate("aus Home.InfoPoint")].filter(Boolean).join(" · ");
}

// «×2», «×0,5»; обычный вес (1 или неизвестный) — без пометки
export const weightTag = (weight) => (weight != null && weight !== 1 ? `×${String(weight).replace(".", ",")}` : null);

// Учебный год листа: по самой ранней дате оценки или пропуска, иначе по дате загрузки
function yearOf(data) {
  const dates = [
    ...(data?.subjects ?? []).flatMap((s) => (s.grades ?? []).map((g) => g.date)),
    ...(data?.absences?.days ?? []).map((d) => d.date),
    ...(data?.absences?.hours ?? []).map((h) => h.date),
  ].filter(Boolean);
  const first = dates.sort()[0] ?? data?.fetchedAt?.slice(0, 10) ?? null;
  return schoolYear(first);
}

const absencesOf = (data, half) => ({ stats: absenceStats(data?.absences, half), entries: absenceEntries(data?.absences, half) });

// Лист полугодия: предметы с оценками (новые первыми), их Schnitt и общий, пропуски
export function halbjahrSheet(data, half) {
  const subjects = (data?.subjects ?? [])
    .map((s) => ({ code: s.code, name: s.name, grades: gradesOf(s, half) }))
    .filter((s) => s.grades.length > 0)
    .map((s) => ({ ...s, average: averageOf(s.grades) }));
  const averages = subjects.map((s) => s.average).filter((v) => v != null);
  return {
    kind: "halbjahr",
    half,
    year: yearOf(data),
    subjects,
    average: averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : null,
    count: subjects.reduce((sum, s) => sum + s.grades.length, 0),
    absences: absencesOf(data, half),
  };
}

// Лист Zeugnis: Endnoten школы за оба полугодия (нет — null), пропуски за год
export function zeugnisSheet(data) {
  return {
    kind: "zeugnis",
    year: yearOf(data),
    subjects: zeugnisOf(data).map((s) => ({ code: s.code, name: s.name, finals: s.finals })),
    absences: absencesOf(data, null),
  };
}

// Лист «Fehlzeiten» полугодия
export const fehlzeitenSheet = (data, half) => ({ kind: "fehlzeiten", half, year: yearOf(data), absences: absencesOf(data, half) });

// Лист для вкладки «Noten»: "1" | "2" | "zeugnis"
export const sheetForTab = (data, tab) => (tab === "zeugnis" ? zeugnisSheet(data) : halbjahrSheet(data, Number(tab)));
