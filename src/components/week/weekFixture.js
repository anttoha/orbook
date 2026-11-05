// Неделя для тестов: все случаи, которые встречаются в настоящем плане.
// Данные выдуманные: настоящий план школы в репозиторий не кладём.
const base = { start: "08:30", end: "09:15", status: "normal", subject: { code: "Ma", name: "Mathe" }, teacher: "T03", room: "102", course: { nr: "131", label: "Ma" }, changes: {}, moved: null, info: null, examId: null };

export const hardLessons = [
  { ...base, period: 0, start: "06:40", end: "07:25", subject: { code: "AGTan", name: null } },
  { ...base, period: 1 },
  { ...base, period: 2, status: "substitution", subject: null, course: null, changes: { room: { old: null, new: "305" }, teacher: { old: "T25", new: "T26" } }, info: "En (T25) fällt aus" },
  { ...base, period: 3, status: "added", subject: null, course: null, changes: {}, info: "Klassensprecherkonferenz" },
  { ...base, period: 4, status: "cancelled", teacher: null, room: null, moved: { from: null, to: { period: 1, date: "2026-10-02" } }, info: "Ma (T03) verlegt nach Fr (02.10.) St.1" },
  { ...base, period: 5, status: "moved", course: null, moved: { from: { period: 7, date: null }, to: null }, changes: { subject: { old: "Ma", new: "WR" } }, subject: { code: "WR", name: null } },
  { ...base, period: 6, status: "room_change", changes: { room: { old: null, new: "303" } }, room: "303" },
  { ...base, period: 7, status: "substitution", teacher: null, room: null, course: null },
  // параллельные курсы в одном часу, один из них без предмета
  { ...base, period: 8, subject: { code: "Sp", name: "Sport" }, course: { nr: "141", label: "SpJu" } },
  { ...base, period: 8, status: "substitution", subject: null, course: null },
  // у 10-го урока нет времени
  { ...base, period: 10, start: null, end: null, status: "cancelled", teacher: null, room: null },
];

const day = (date, weekday, over = {}) => ({ date, weekday, status: "ok", freeReason: null, isToday: false, week: 2, publishedAt: "2026-11-02T07:06:00+01:00", fetchedAt: "2026-11-02T13:00:55+01:00", changedAt: "2026-11-02T07:08:04+01:00", stale: false, info: [], lessons: hardLessons, expectedLessons: [], exams: [], ...over });

export const hardWeek = {
  week: "2026-W45",
  from: "2026-11-02",
  to: "2026-11-06",
  abWeek: 1,
  summary: { cancelled: 2, substitutions: 3, roomChanges: 1, moved: 1, added: 1, exams: 0 },
  days: [
    day("2026-11-02", "Mo", { isToday: true }),
    day("2026-11-03", "Di"),
    day("2026-11-04", "Mi", { publishedAt: null, fetchedAt: null }),
    day("2026-11-05", "Do", { status: "not_published", lessons: [], expectedLessons: hardLessons, publishedAt: null }),
    day("2026-11-06", "Fr", { status: "holiday", freeReason: "holiday", lessons: [] }),
  ],
};
