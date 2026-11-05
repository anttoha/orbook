// Курси класу для екранів «Welche Kurse hast du?» і «Meine Kurse» (GET /api/courses).

// Обов'язкові курси показуються завжди, вибіркові можна вмикати
export function splitCourses(courses) {
  const list = courses ?? [];
  return { required: list.filter((course) => !course.optional), optional: list.filter((course) => course.optional) };
}

// «Sport · SpJu»: група відрізняє курси одного предмета.
// subject.name буває null: тоді показуємо код. group теж буває null.
export function courseTitle(course) {
  const name = course.subject?.name ?? course.subject?.code ?? course.label ?? "";
  const label = course.label !== course.subject?.code ? course.label : null;
  const hint = course.group ?? label;
  return hint && hint !== name ? `${name} · ${hint}` : name;
}

// Натиснули перемикач: додати номер курсу або прибрати його
export function togglePicked(picked, nr) {
  return picked.includes(nr) ? picked.filter((item) => item !== nr) : [...picked, nr];
}

// Порожній picked означає «показати все», тому «усі курси за вибором вимкнено» записуємо так.
// Такого номера курсу немає, тож фільтри плану просто не знаходять жодного вибіркового курсу.
export const NO_OPTIONAL = ["keine"];

// Номери всіх вибіркових курсів: їх просить toggleCourse
export const optionalNumbers = (courses) => (courses ?? []).filter((course) => course.optional).map((course) => course.nr);

// Чи видно вибірковий курс у плані: порожній picked — видно всі
export const isCourseOn = (picked, nr) => picked.length === 0 || picked.includes(nr);

// Чи видно курс будь-якого типу: за вибором — як вище, обов'язковий — якщо учень його не сховав
export const isCourseVisible = (course, picked, hiddenRequired = []) =>
  course.optional ? isCourseOn(picked, course.nr) : !hiddenRequired.includes(course.nr);

// Перемкнути курс у вже вибраному стані (allOptional — номери всіх вибіркових курсів).
// Усі ввімкнені = порожній список: так і новий курс школи теж буде видно.
export function toggleCourse(picked, nr, allOptional) {
  const current = picked.length ? picked.filter((item) => item !== NO_OPTIONAL[0]) : allOptional;
  const next = togglePicked(current, nr);
  if (next.length === 0) return NO_OPTIONAL;
  return allOptional.every((item) => next.includes(item)) ? [] : next;
}

// «7 von 8»: обов'язкові видно завжди, до них додаємо ввімкнені вибіркові
export function courseCount(courses, picked, hiddenRequired = []) {
  const list = courses ?? [];
  const on = list.filter((course) => isCourseVisible(course, picked, hiddenRequired));
  return { on: on.length, all: list.length };
}

// Предмети видимих курсів для «Fachfarben», кожен один раз.
// subject буває null, а name — null: тоді беремо назву з meta.subjects або код.
export function visibleSubjects(courses, picked, metaSubjects, hiddenRequired = []) {
  const subjects = new Map();
  for (const course of courses ?? []) {
    const code = course.subject?.code;
    if (!code || subjects.has(code)) continue;
    if (!isCourseVisible(course, picked, hiddenRequired)) continue;
    subjects.set(code, { code, name: course.subject.name ?? metaSubjects?.[code] ?? code });
  }
  return [...subjects.values()];
}
