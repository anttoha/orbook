// ─────────────────────────────────────────────────────────────
// exams.js — логіка екрана Klausuren без React: групи, фільтр, зворотний відлік.
// Основа — гайд orbook-be, docs/frontend/04-klausuren.md.
// ─────────────────────────────────────────────────────────────
import { addDays, mondayOf, shortDate, subjectName, weekdayShort } from "./format";

// Фільтр за замовчуванням: показати все, що попереду
export const EMPTY_FILTER = { type: null, subjects: [], range: null, past: false };

// Період у фільтрі → скільки днів уперед
const RANGE_DAYS = { "2w": 14, month: 31, half: 183 };

// «Diese Woche» / «Nächste Woche» / «Später». Порожні групи не показуємо
export function groupExams(exams, today) {
  const nextMonday = addDays(mondayOf(today), 7);
  const afterNext = addDays(nextMonday, 7);
  const groups = [
    { title: "Diese Woche", exams: exams.filter((exam) => exam.date < nextMonday) },
    { title: "Nächste Woche", exams: exams.filter((exam) => exam.date >= nextMonday && exam.date < afterNext) },
    { title: "Später", exams: exams.filter((exam) => exam.date >= afterNext) },
  ];
  return groups.filter((group) => group.exams.length > 0);
}

// Вибрані вид, предмети і період. Період до минулих записів не застосовується.
// Фільтруємо на пристрої: число на кнопці «3 anzeigen» змінюється одразу і працює без мережі
export function filterExams(exams, filter, today) {
  const days = RANGE_DAYS[filter.range];
  const lastDay = days && !filter.past ? addDays(today, days) : null;
  return exams.filter(
    (exam) =>
      (!filter.type || exam.type === filter.type) &&
      (filter.subjects.length === 0 || filter.subjects.includes(exam.subject?.code)) &&
      (!lastDay || exam.date <= lastDay),
  );
}

// Чи вибрано щось, крім показу за замовчуванням (крапка на кнопці фільтра)
export const isFilterActive = (filter) => Boolean(filter.type || filter.range || filter.past || filter.subjects.length > 0);

// Натиснули предмет: додати його або прибрати
export const toggleSubject = (subjects, code) => (subjects.includes(code) ? subjects.filter((item) => item !== code) : [...subjects, code]);

// Коди для чипів без повторів, у порядку дат. Вибраний лишається, навіть якщо записів уже немає: інакше його не зняти
export function subjectChips(exams, selected = []) {
  const codes = exams.map((exam) => exam.subject?.code).filter(Boolean);
  return [...new Set([...codes, ...selected])];
}

// Предмети у вікні фільтра: з курсів учня і з Klausuren, без повторів. subject буває null.
// Вибіркові курси — лише вибрані; нічого не вибрано — усі, як у плані (visibleLessons)
export function filterSubjects(courses, picked, exams) {
  const myCourses = picked.length > 0 ? courses.filter((course) => !course.optional || picked.includes(course.nr)) : courses;
  const subjects = new Map();
  for (const { subject } of [...myCourses, ...exams]) {
    if (subject?.code && !subjects.has(subject.code)) subjects.set(subject.code, subject);
  }
  return [...subjects.values()];
}

// Збережений список застарів: daysLeft порахував сервер у день збереження. Віднімаємо, скільки днів минуло.
// Рахуємо від часу збереження, а не від дати: на демо «сьогодні» вигадане, і дата нічого не сказала б
export const withDaysLeft = (exams, daysPassed) => exams.map((exam) => ({ ...exam, daysLeft: exam.daysLeft - daysPassed }));

// Те саме для майбутніх: те, що вже минуло, прибираємо
export const freshenExams = (exams, daysPassed) => withDaysLeft(exams, daysPassed).filter((exam) => exam.daysLeft >= 0);

// Вид запису в давальному відмінку: види задає адмін, тому для незнайомого є запасний текст
const UNTIL = { Klausur: "zur Klausur", Test: "zum Test", Abgabe: "zur Abgabe" };

// Картка відліку у вікні: велике число і підпис. Сьогодні й минуле — без числа
export function examCountdown(exam) {
  const n = exam.daysLeft;
  if (n === 0) return { number: null, label: "Heute" };
  if (n < 0) return { number: null, label: `vor ${-n} ${n === -1 ? "Tag" : "Tagen"}` };
  return { number: n, label: `${n === 1 ? "Tag" : "Tage"} bis ${UNTIL[exam.type] ?? "zum Termin"}` };
}

// Картка «2 Tage bis · Klausur Mathe · Fr, 19. Sept · 1. Stunde» над календарем на ПК (макет 14).
// Сьогодні — без числа: «Heute». subject буває null — тоді «Ohne Fach»
export function nextExamCard(exam) {
  const n = exam.daysLeft;
  const lesson = exam.lesson ? ` · ${exam.lesson}. Stunde` : "";
  return {
    number: n > 0 ? n : null,
    eyebrow: n > 0 ? `${n === 1 ? "Tag" : "Tage"} bis` : "Heute",
    title: `${exam.type} ${subjectName(exam.subject)}`,
    when: `${weekdayShort(exam.date)}, ${shortDate(exam.date)}${lesson}`,
  };
}

// Пошук «Thema oder Fach suchen» (ПК): кожне слово має бути в темі, предметі або виді
export function searchExams(exams, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return exams;
  return exams.filter((exam) => {
    const text = [exam.topic, exam.subject?.name, exam.subject?.code, exam.type].filter(Boolean).join(" ").toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

// Id з адреси йде прямо в шлях запиту, тому пропускаємо тільки цифри
export const isExamId = (id) => /^[1-9]\d{0,18}$/.test(id ?? "");
