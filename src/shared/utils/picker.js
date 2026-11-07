// ─────────────────────────────────────────────────────────────
// picker.js — вибір зі списком і пошуком (ui/ListPicker, макети design/neu/19c-kurs-auswahl).
// Пункт списку: { value, code (колір предмета), title, subtitle, group }.
// Тут — чисті функції: пункти для курсів і предметів, пошук, групи.
// ─────────────────────────────────────────────────────────────
import { subjectName } from "./format";

// Для пошуку: малі літери, без умлаутів і наголосів («Französisch» знаходиться за «franz» і «französ»)
export const normalize = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Пункти, у яких запит є в назві, підписі або коді. Порожній запит — усі
export function filterItems(items, query) {
  const q = normalize(query).trim();
  if (!q) return items;
  return items.filter((item) => [item.title, item.subtitle, item.code, item.value].some((text) => normalize(text).includes(q)));
}

// Групи в порядку першої появи: [{ group, items }]. Пункти без групи — в одній групі null
export function groupItems(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.group ?? null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups].map(([group, list]) => ({ group, items: list }));
}

const byTitle = (a, b) => a.title.localeCompare(b.title, "de");

// Курси (/api/admin/courses) для Muster: спершу «Vorschlag» (що тут у плані), далі всі за алфавітом.
// Підпис «T13 · Kurs 145» розрізняє два однакові «Französisch»
export function courseItems(courses, suggested = []) {
  const items = (courses ?? []).map((course) => ({
    value: course.nr,
    code: course.subject?.code ?? course.label,
    title: course.group ? `${subjectName(course.subject)} · ${course.group}` : subjectName(course.subject),
    subtitle: [course.teacher ?? "ohne Lehrer", `Kurs ${course.nr}`].join(" · "),
  }));
  const top = items.filter((item) => suggested.includes(item.value)).sort(byTitle).map((item) => ({ ...item, group: "Vorschlag · stand hier im Plan" }));
  const rest = items.filter((item) => !suggested.includes(item.value)).sort(byTitle).map((item) => ({ ...item, group: "Alle Kurse" }));
  return [...top, ...rest];
}

// Предмети для форм (Klausur, Hausaufgabe, Material, Termin, Notiz): спершу «Deine Fächer», далі решта.
// subjects — [{ code, name }], mine — коди «своїх» (з вибраних курсів / уроків дня). mine порожній — без груп.
// courses — курси класу: другий рядок — учителі предмета («T03», «T13, T18»), без курсів — нічого
export function subjectItems(subjects, mine = [], courses = []) {
  const own = new Set(mine);
  const teachers = (code) => [...new Set(courses.filter((c) => c.subject?.code === code).map((c) => c.teacher).filter(Boolean))].join(", ") || null;
  const items = (subjects ?? []).map((subject) => ({
    value: subject.code,
    code: subject.code,
    title: subjectName(subject),
    subtitle: teachers(subject.code),
  }));
  if (own.size === 0 || own.size >= items.length) return items.sort(byTitle);
  return [
    ...items.filter((item) => own.has(item.value)).sort(byTitle).map((item) => ({ ...item, group: "Deine Fächer" })),
    ...items.filter((item) => !own.has(item.value)).sort(byTitle).map((item) => ({ ...item, group: "Alle Fächer" })),
  ];
}

// Коди «своїх» предметів: курси без Wahl + вибрані Wahl (як formSubjects)
export const mySubjectCodes = (courses, picked) =>
  [...new Set((courses ?? []).filter((course) => !course.optional || picked.includes(course.nr)).map((course) => course.subject?.code).filter(Boolean))];

// Текст поля для кількох вибраних: «Mathe, Deutsch» або «Mathe, Deutsch +2»
export function summaryText(items, values, max = 2) {
  const titles = values.map((value) => items.find((item) => item.value === value)?.title ?? value);
  return titles.length > max ? `${titles.slice(0, max).join(", ")} +${titles.length - max}` : titles.join(", ");
}
