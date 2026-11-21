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

// Оценки предмета: полугодие или (half null) весь год, новые первыми
const gradesIn = (subject, half) =>
  half == null ? [...(subject?.grades ?? [])].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")) : gradesOf(subject, half);

// Лист полугодия (half null — весь учебный год): предметы с оценками (новые первыми), их Schnitt и общий, пропуски
export function halbjahrSheet(data, half) {
  const subjects = (data?.subjects ?? [])
    .map((s) => ({ code: s.code, name: s.name, grades: gradesIn(s, half) }))
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

// Лист «Fehlzeiten» полугодия (half null — весь год)
export const fehlzeitenSheet = (data, half) => ({ kind: "fehlzeiten", half, year: yearOf(data), absences: absencesOf(data, half) });

// ── Варианты окна «Als PDF» (макеты 37 handy-06, pc-02) ──
// ORBook: "1" | "2" | "jahr" | "zeugnis" | "fehlzeiten"; оригинал InfoPoint: "summary" | "detail"
export const ORBOOK_VARIANTS = ["1", "2", "jahr", "zeugnis", "fehlzeiten"];
export const ORIGINAL_VARIANTS = ["summary", "detail"];
export const isOriginal = (variant) => ORIGINAL_VARIANTS.includes(variant);

export function sheetFor(data, variant) {
  if (variant === "zeugnis") return zeugnisSheet(data);
  if (variant === "fehlzeiten") return fehlzeitenSheet(data, null);
  return halbjahrSheet(data, variant === "jahr" ? null : Number(variant));
}

// Имя файла: «Noten-1-Halbjahr-2026-27.pdf», «InfoPoint-Uebersicht-2026-11-16.pdf»
export function pdfName(data, variant) {
  const year = (yearOf(data) ?? "").replace("/", "-");
  const day = data?.updatedAt ?? data?.fetchedAt?.slice(0, 10) ?? "";
  const names = {
    1: `Noten-1-Halbjahr-${year}`,
    2: `Noten-2-Halbjahr-${year}`,
    jahr: `Noten-Schuljahr-${year}`,
    zeugnis: `Zeugnis-${year}`,
    fehlzeiten: `Fehlzeiten-${year}`,
    summary: `InfoPoint-Uebersicht-${day}`,
    detail: `InfoPoint-Alle-Noten-${day}`,
  };
  return `${(names[variant] ?? "Noten").replace(/-+$/, "")}.pdf`;
}

// Сколько страниц A4 займёт лист высотой heightPx (CSS-пиксели при ширине 210 мм), поля 14 мм сверху и снизу
export const A4_CONTENT_PX = Math.round((794 * 269) / 210); // 1017
export const pageCount = (heightPx) => Math.max(1, Math.ceil((heightPx - 4) / A4_CONTENT_PX));
