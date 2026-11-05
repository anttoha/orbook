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
