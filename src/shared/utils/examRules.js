// ─────────────────────────────────────────────────────────────
// examRules.js — перевірки форми «Klausur eintragen» (з гайду, docs/frontend/04-klausuren.md).
// Сервер перевіряє те саме і відповість 422. Тут — щоб показати помилку ще до відправки.
// ─────────────────────────────────────────────────────────────
import { subjectName, weekdayShort } from "./format";

export const TOPIC_MAX = 60;

// null, якщо тема гаразд, інакше { type, message }
export function validateTopic(value) {
  const topic = (value ?? "").trim();
  if (topic.length > TOPIC_MAX) return { type: "too_long", message: `Das Thema darf höchstens ${TOPIC_MAX} Zeichen lang sein.` };
  // eslint-disable-next-line no-control-regex -- саме керівні символи й шукаємо
  if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(topic)) return { type: "control_chars", message: "Das Thema muss in einer Zeile stehen." };
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(topic)) return { type: "contains_email", message: "Bitte keine E-Mail-Adressen im Thema." };
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:de|com|net|org|eu|io|app|info|ru|me|ly)\b)/i.test(topic)) {
    return { type: "contains_link", message: "Bitte keine Links im Thema." };
  }
  for (const run of topic.match(/[+\d][\d\s/()-]*/g) ?? []) {
    if ((run.match(/\d/g) ?? []).length >= 9) return { type: "contains_phone", message: "Bitte keine Telefonnummern im Thema." };
  }
  return null;
}

// Дата: не далі року вперед і не раніше 14 днів тому
export function validateExamDate(dateIso, todayIso) {
  const day = Date.parse(`${dateIso}T00:00:00Z`);
  const today = Date.parse(`${todayIso}T00:00:00Z`);
  if (Number.isNaN(day)) return { type: "invalid", message: "Bitte ein Datum wählen." };
  const days = Math.round((day - today) / 86400000);
  if (days > 365) return { type: "too_far", message: "Das Datum liegt mehr als ein Jahr in der Zukunft." };
  if (days < -14) return { type: "too_old", message: "Das Datum liegt mehr als 14 Tage in der Vergangenheit." };
  return null;
}

// Помилки форми за полями: { subject, date, topic }. Порожній об'єкт — можна надсилати.
// Стара дата при правці не перевіряється: сервер її приймає, інакше не виправити тему в минулій записі
export function validateExamForm(form, today, originalDate = null) {
  const errors = {};
  if (!form.subject) errors.subject = "Bitte ein Fach wählen.";
  const dateError = form.date === originalDate ? null : validateExamDate(form.date, today);
  if (dateError) errors.date = dateError.message;
  const topicError = validateTopic(form.topic);
  if (topicError) errors.topic = topicError.message;
  return errors;
}

// Запис → поля форми і назад
export const examToForm = (exam) => ({ type: exam?.type ?? null, subject: exam?.subject?.code ?? null, date: exam?.date ?? "", lesson: exam?.lesson ?? null, topic: exam?.topic ?? "" });

// «Mathe · Fr 19.09.» для діалогів
export function examLabel(exam) {
  const [, month, day] = exam.date.split("-");
  return `${subjectName(exam.subject)} · ${weekdayShort(exam.date)} ${day}.${month}.`;
}

// Предмети для форми: з курсів учня і meta.subjects, без повторів. current — предмет самої записи при правці.
// Вибіркові курси — лише вибрані; subject у курсі буває null
export function formSubjects(courses, picked, metaSubjects, current) {
  const myCourses = picked.length > 0 ? courses.filter((course) => !course.optional || picked.includes(course.nr)) : courses;
  const fromMeta = Object.entries(metaSubjects ?? {}).map(([code, name]) => ({ code, name }));
  const subjects = new Map();
  for (const subject of [...myCourses.map((course) => course.subject), ...fromMeta, current]) {
    if (subject?.code && !subjects.has(subject.code)) subjects.set(subject.code, subject);
  }
  return [...subjects.values()];
}

// Учитель увійшов своїм Lehrer-Code (частина 14). Старий сервер role не надсилав — тоді це клас
export const isTeacher = (me) => me?.role === "teacher";

// Чи можна створювати: право в коді вчителя чи Editor-Code, або адмін дозволив усім
export const canCreateExam = (me) => Boolean(me?.teacher?.canCreate || me?.editor?.canCreate || (!isTeacher(me) && me?.features?.examsWithoutCode));

// Hausaufgaben: лише з правом canHomework (examsWithoutCode тут не діє)
export const canCreateHomework = (me) => Boolean(me?.teacher?.canHomework || me?.editor?.canHomework);

// Куди веде «+». Код є (або це вчитель), але без права — кнопки немає (null)
export function addExamTarget(me) {
  if (canCreateExam(me)) return "/testen/neu";
  return me?.editor || isTeacher(me) ? null : "/editor-code?weiter=neu";
}

// «+» у Hausaufgaben: учню без коду — спершу Editor-Code
export function addHomeworkTarget(me) {
  if (canCreateHomework(me)) return "/testen/hausaufgaben/neu";
  return me?.editor || isTeacher(me) ? null : "/editor-code?weiter=hausaufgabe";
}

// Текст помилки коду: сервер пише по-німецьки, до неправильного коду додаємо, скільки спроб лишилось
export function unlockErrorText(error, retryText) {
  if (error.code === "locked") return retryText(error);
  const left = error.details?.attemptsLeft;
  if (error.code === "code_invalid" && left != null) return `${error.message} Noch ${left} ${left === 1 ? "Versuch" : "Versuche"}.`;
  return error.message;
}

// «2027-07-31» → «31.07.2027»
export const fullDate = (iso) => iso.split("-").reverse().join(".");

// Рядок над заголовком форми: хто записує («Lehrkraft · Mü», «Editor · Code A»)
export function formEyebrow(me, fallback) {
  if (me?.teacher?.short) return `Lehrkraft · ${me.teacher.short}`;
  return me?.editor?.label ? `Editor · ${me.editor.label}` : fallback;
}
