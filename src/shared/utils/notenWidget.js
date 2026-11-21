import { absenceEntries, absenceStats, defaultHalf, gradeKey, gradesOf, overviewOf } from "./noten";

// ─────────────────────────────────────────────────────────────
// Часть 39: что показывают виджеты «Noten», «Neue Noten», «Fehlzeiten» (превью в «Widget einstellen»).
// Тот же расчёт повторяет Android — android/…/widget/NotenWidget.kt (там свой тест на те же случаи).
// data — кеш Noten (формат POST /api/noten/abrufen), fresh — ключи «neu»-оценок (gradeKey)
// ─────────────────────────────────────────────────────────────

// Вместо оценки и чисел, пока «Noten anzeigen» выключено: по «•••» не угадать, хорошая или плохая
export const HIDDEN = "•••";

// «Stand 16.09.»: дата школы, иначе — когда забрали
export const widgetStand = (data) => data?.updatedAt ?? data?.fetchedAt?.slice(0, 10) ?? null;

export function notenWidget(data, fresh = []) {
  const half = defaultHalf(data);
  const known = new Set(fresh);
  const isFresh = (code, g) => known.has(gradeKey(code, g));
  const overview = overviewOf(data, half);
  const subjects = overview.subjects.map((s) => ({ code: s.code, name: s.name, average: s.average, fresh: s.list.some((g) => isFresh(s.code, g)) }));
  // Предметы с новой оценкой — первыми (это и есть «важнее» в правиле fit), остальные — как в InfoPoint
  const ordered = [...subjects.filter((s) => s.fresh), ...subjects.filter((s) => !s.fresh)];
  const latest = (data?.subjects ?? [])
    .flatMap((s) => gradesOf(s, half).filter((g) => g.grade).map((g) => ({ code: s.code, subject: s.name, grade: g.grade, value: g.value, what: g.note ?? null, date: g.date, fresh: isFresh(s.code, g) })))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return {
    half,
    average: overview.average,
    subjects: ordered,
    latest,
    absences: absenceStats(data?.absences, half),
    entries: absenceEntries(data?.absences, half),
    stand: widgetStand(data),
  };
}
