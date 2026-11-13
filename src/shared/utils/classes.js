// ─────────────────────────────────────────────────────────────
// Несколько классов на одном устройстве (часть 29). Чистые функции без React:
// список классов устройства, их имена и цвета, «сегодня одной строкой» на карточке.
//
// Класс устройства (classesStore.list):
//   { id: 2, name: "5a", school: { id, name } | null, role: "class" | "teacher",
//     label: "Geschwister", color: "englisch", startOpen: false, gone: false }
// name / school / role приходят с сервера (GET /api/auth/me → classes[]),
// label / color / startOpen / порядок — только на устройстве.
// ─────────────────────────────────────────────────────────────
import { CLASS_COLORS } from "../constants/classColors";
import { daysBetween, numericDate, subjectName, visibleLessons, weekdayShort } from "./format";

// Свободный цвет для нового класса: первый, которого ещё нет в списке (все заняты — по кругу)
export function nextClassColor(list) {
  const used = new Set(list.map((item) => item.color));
  const keys = Object.keys(CLASS_COLORS);
  return keys.find((key) => !used.has(key)) ?? keys[list.length % keys.length];
}

// Слить список устройства с классами сервера (me.classes):
// • порядок, имя на устройстве и цвет остаются свои;
// • новый класс с сервера встаёт в конец со свободным цветом;
// • класса больше нет на сервере (код выключили) — остаётся с gone: true, пока его не уберут.
export function mergeClasses(local, server) {
  const fromServer = new Map((server ?? []).map((item) => [item.id, item]));
  const merged = local.map((item) => {
    const fresh = fromServer.get(item.id);
    if (!fresh) return { ...item, gone: true };
    return { ...item, name: fresh.name ?? item.name, school: fresh.school ?? item.school ?? null, role: fresh.role ?? item.role, canEdit: Boolean(fresh.canEdit), gone: false };
  });
  for (const fresh of server ?? []) {
    if (merged.some((item) => item.id === fresh.id)) continue;
    merged.push(newClassEntry(fresh, merged));
  }
  return merged;
}

// Запись нового класса (ответ входа: class { id, name, school })
export const newClassEntry = (fresh, list, label = "") => ({
  id: fresh.id,
  name: fresh.name ?? "",
  school: fresh.school ?? null,
  role: fresh.role ?? "class",
  canEdit: Boolean(fresh.canEdit), // на устройстве открыт Editor-/Lehrer-Code этого класса
  label: label.trim(),
  color: nextClassColor(list),
  startOpen: false,
  gone: false,
});

// Заголовок карточки: имя на устройстве, без него — «Klasse 9b»
export const classTitle = (item, t = (s) => s) => item?.label || `${t("Klasse")} ${item?.name ?? ""}`.trim();
// Подпись «9b · Goethe-Gymnasium» (школы может не быть)
export const classSubtitle = (item) => [item?.name, item?.school?.name].filter(Boolean).join(" · ");

// Свои настройки класса на устройстве (часть 29): у активного класса они лежат в userStore сверху,
// у остальных — в userStore.byClass[id]. Пустой класс — как новый: курсы ещё не выбраны
export const CLASS_FIELDS = ["notes", "picked", "hiddenRequired", "coursesChosen", "checkedPlan", "allCourses"];
export const EMPTY_CLASS_DATA = { notes: [], picked: [], hiddenRequired: [], coursesChosen: false, checkedPlan: [], allCourses: false };

// Переключение класса в userStore: текущие поля → в byClass[from], поля класса to → наверх
export const swapClassData = (state, from, to) => swapFields(state, from, to, CLASS_FIELDS, EMPTY_CLASS_DATA);

// То же для любого стора: fields — что своё у каждого класса, empty — как выглядит новый класс
export function swapFields(state, from, to, fields, empty) {
  if (from === to) return {};
  const byClass = { ...(state.byClass ?? {}) };
  if (from != null) byClass[from] = Object.fromEntries(fields.map((key) => [key, state[key]]));
  const next = { ...empty, ...(byClass[to] ?? {}) };
  delete byClass[to];
  return { ...next, byClass };
}

// Настройки «Meine Kurse» любого класса (активного — сверху, остальных — из byClass)
export function classPrefs(state, id, activeId) {
  const data = id === activeId ? state : (state.byClass?.[id] ?? EMPTY_CLASS_DATA);
  return { picked: data.picked ?? [], hiddenRequired: data.hiddenRequired ?? [] };
}

// ── «Сегодня одной строкой» на карточке ──

// Клетки дня: одна на урок (параллельные курсы одного урока — тоже отдельные клетки).
// Уроки уже отфильтрованы по «Meine Kurse». Отмена и замена — флажки для рисования
export const todayCells = (lessons) =>
  lessons.map((lesson) => ({
    key: `${lesson.period}-${lesson.course?.nr ?? lesson.subject?.code ?? ""}`,
    code: lesson.subject?.code ?? null,
    cancelled: lesson.status === "cancelled",
    changed: lesson.status !== "normal" && lesson.status !== "cancelled",
  }));

// Сколько клеток рисовать: не меньше 7 (на макете ряд всегда полный)
export const cellCount = (cells) => Math.max(7, cells.length);

// Главное одной фразой: { tone: "danger" | "ok" | "muted", lead, rest }
//   «Englisch fällt aus · Mathe vertreten», «Alles wie geplant · Schluss 12:20», «1. Stunde fällt aus · Beginn 08:20»
export function daySummary(day, lessons, t = (s) => s) {
  if (!day) return null;
  if (day.status === "holiday") return { tone: "muted", lead: t("Heute frei"), rest: "" };
  if (day.status === "not_published" || day.status === "unavailable") return { tone: "muted", lead: t("Noch kein Plan für heute"), rest: "" };
  if (lessons.length === 0) return { tone: "muted", lead: t("Heute frei"), rest: "" };

  const cancelled = lessons.filter((l) => l.status === "cancelled");
  const changed = lessons.filter((l) => l.status !== "normal" && l.status !== "cancelled");
  const running = lessons.filter((l) => l.status !== "cancelled");
  const first = running[0];
  const last = running.at(-1);

  if (cancelled.length === 0 && changed.length === 0) {
    return { tone: "ok", lead: t("Alles wie geplant"), rest: last?.end ? `${t("Schluss")} ${last.end}` : "" };
  }
  const lead = cancelled.length > 0 ? cancelledText(cancelled, lessons, t) : changedText(changed, t);
  // Отменён первый урок — важнее всего, когда начинать; иначе — что ещё поменялось
  let rest = "";
  if (cancelled.length > 0 && changed.length > 0) rest = changedText(changed, t);
  else if (cancelled.some((l) => l.period === lessons[0].period) && first?.start) rest = `${t("Beginn")} ${first.start}`;
  else if (last?.end) rest = `${t("Schluss")} ${last.end}`;
  return { tone: cancelled.length > 0 ? "danger" : "muted", lead, rest };
}

const uniqueNames = (lessons) => [...new Set(lessons.map((l) => subjectName(l.subject)))];

// «Englisch fällt aus», «Englisch und Kunst fallen aus», отменён первый урок — «1. Stunde fällt aus»
function cancelledText(cancelled, lessons, t) {
  if (cancelled.length === 1 && cancelled[0].period === lessons[0].period) return `${cancelled[0].period}. ${t("Stunde fällt aus")}`;
  const names = uniqueNames(cancelled);
  if (names.length === 1) return `${names[0]} ${t("fällt aus")}`;
  if (names.length === 2) return `${names[0]} ${t("und")} ${names[1]} ${t("fallen aus")}`;
  return `${cancelled.length} ${t("Stunden fallen aus")}`;
}

// «Mathe vertreten», «2 Änderungen»
function changedText(changed, t) {
  const names = uniqueNames(changed);
  if (names.length === 1) return `${names[0]} ${t("vertreten")}`;
  return `${changed.length} ${t("Änderungen")}`;
}

// Уроки дня по «Meine Kurse» этого класса (у свободного дня и дня без плана — пусто)
export const myLessons = (day, courses, prefs) =>
  day?.status === "ok" ? visibleLessons(day.lessons ?? [], courses ?? [], new Set(prefs.picked), new Set(prefs.hiddenRequired)) : [];

// Ближайший тест моих курсов за неделю вперёд: «Fr · Mathe-Test» (или дата, если дальше 6 дней).
// subjects — коды предметов моих курсов (пусто — все). Нет — null
export function nextClassExam(exams, subjects, today) {
  const mine = (exams ?? []).filter((exam) => {
    const left = daysBetween(today, exam.date);
    return left >= 0 && left <= 14 && (subjects.size === 0 || subjects.has(exam.subject?.code));
  });
  const exam = mine.sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!exam) return null;
  const when = daysBetween(today, exam.date) <= 6 ? weekdayShort(exam.date) : numericDate(exam.date);
  return { id: exam.id, text: `${when} · ${subjectName(exam.subject)}-${exam.type ?? "Test"}` };
}

// Коды предметов моих курсов (выбранные курсы по выбору + обязательные, не скрытые). Ничего не выбрано — пусто (= все)
export function mySubjectCodes(courses, prefs) {
  if (prefs.picked.length === 0 && prefs.hiddenRequired.length === 0) return new Set();
  const picked = new Set(prefs.picked);
  const hidden = new Set(prefs.hiddenRequired);
  const allOptional = picked.size === 0;
  return new Set(
    (courses ?? [])
      .filter((c) => (c.optional ? allOptional || picked.has(c.nr) : !hidden.has(c.nr)))
      .map((c) => c.subject?.code)
      .filter(Boolean),
  );
}

// При запуске: какой класс открыть. Есть «Beim Start öffnen» — его; иначе, если классов больше одного, — экран «Meine Klassen»
export function startTarget(list) {
  const live = list.filter((item) => !item.gone);
  const pinned = live.find((item) => item.startOpen);
  if (pinned) return { classId: pinned.id, page: null };
  return { classId: null, page: list.length > 1 ? "/klassen" : null };
}

// Ошибка «Klasse hinzufügen» → текст под полем (сервер пишет по-немецки, но свои тексты — из дизайна)
export function addClassErrorText(error, t = (s) => s) {
  if (error?.code === "already_member") return t("Diese Klasse hast du schon.");
  if (error?.code === "too_many_classes") {
    const max = error.details?.maxClasses;
    return max ? `${t("Mehr als")} ${max} ${t("Klassen gehen auf einem Gerät nicht.")}` : error.message;
  }
  if (error?.code === "wrong_password" || error?.code === "code_invalid") return t("Diesen Code kennen wir nicht.");
  if (error?.status === 0) return t("Dafür brauchst du Internet.");
  return error?.message ?? t("Das hat nicht geklappt.");
}

// Lehrer-Code (ORB-L-…) входит через /auth/teacher, всё остальное — через /auth/login
export const isTeacherCode = (code) => /^ORB-?L-?/i.test(code.trim());

// Админка, поле «Klasse» у нового кода (часть 29, макет handy-14): классы всех школ одним списком.
// schools — GET /admin/schools; planClasses — { [schoolId]: GET /admin/schools/{id}/classes } (может не быть).
// Пункт: { value: "1:8b", code: "8b", title: "Klasse 8b", subtitle: "Goethe · neu", schoolId, className, isNew }
export function adminClassItems(schools, planClasses = {}, t = (s) => s) {
  return (schools ?? []).flatMap((school) => {
    const known = new Map((school.classes ?? []).map((c) => [c.name, c.id]));
    const names = [...new Set([...(planClasses[school.id]?.classes ?? []).map((c) => c.name), ...known.keys()])];
    names.sort((a, b) => a.localeCompare(b, "de", { numeric: true }));
    return names.map((name) => {
      const isNew = !known.has(name);
      const where = (schools.length > 1 ? [school.name] : []).concat(isNew ? [t("neu")] : []);
      return { value: `${school.id}:${name}`, code: name, title: `${t("Klasse")} ${name}`, subtitle: where.join(" · ") || null, schoolId: school.id, className: name, isNew };
    });
  });
}
