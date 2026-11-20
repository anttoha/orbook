import { translate } from "../i18n/translate";

// ─────────────────────────────────────────────────────────────
// Lehrkräfte verwalten (часть 34): чистые функции для списка и формы.
// Учитель с сервера: { short, name | null, subjects, source: "plan" | "angepasst" | "eigen", hidden, codeId | null }
// ─────────────────────────────────────────────────────────────

// Крупная строка: полное имя, если есть, иначе Kürzel
export const teacherTitle = (teacher) => teacher.name || teacher.short;

// Метка источника: { text, variant } для Badge. «Ausgeblendet» важнее остальных
export function sourceBadge(teacher) {
  if (teacher.hidden) return { text: translate("Ausgeblendet"), variant: "off" };
  if (teacher.source === "angepasst") return { text: translate("Angepasst"), variant: "changed" };
  if (teacher.source === "eigen") return { text: translate("Eigen"), variant: "exam" };
  return { text: translate("Plan"), variant: "soft" };
}

// Поиск по имени, Kürzel и предметам
export function matchesTeacher(teacher, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [teacher.name, teacher.short, ...teacher.subjects].some((part) => part?.toLowerCase().includes(needle));
}

// Предметы для выбора: предметы класса (коды) и то, что выбрано, но в списке нет («Anderes Fach»)
export function subjectChoices(classCodes, selected) {
  const rest = selected.filter((code) => !classCodes.includes(code));
  return [...classCodes, ...rest];
}

// Подпись под счётчиком: «6 Lehrkräfte · 4 aus dem Plan»
export function teacherCount(teachers) {
  const fromPlan = teachers.filter((teacher) => teacher.source !== "eigen").length;
  return translate("{n} Lehrkräfte · {plan} aus dem Plan", { n: teachers.length, plan: fromPlan });
}

// Форма пуста (новый) или из учителя (правка): { short, name, subjects }
export const teacherForm = (teacher) => ({ short: teacher?.short ?? "", name: teacher?.name ?? "", subjects: teacher ? [...teacher.subjects] : [] });

const sameSet = (a, b) => a.length === b.length && a.every((code) => b.includes(code));

// Тело PATCH: только то, что изменили. Пустой результат — менять нечего
export function teacherPatch(teacher, form) {
  const patch = {};
  const name = form.name.trim();
  if (name !== (teacher.name ?? "")) patch.name = name;
  if (!sameSet(form.subjects, teacher.subjects)) patch.subjects = form.subjects;
  const short = form.short.trim();
  if (teacher.source === "eigen" && short !== teacher.short) patch.short = short;
  return patch;
}

// Тело POST: пустое имя не отправляем
export function newTeacherBody(form) {
  const body = { short: form.short.trim(), subjects: form.subjects };
  const name = form.name.trim();
  if (name) body.name = name;
  return body;
}

// Ошибка сервера → текст под полем: { short?, name?, subjects? } и общий message
export function teacherErrors(error) {
  if (error?.code === "short_taken") return { short: translate("Dieses Kürzel gibt es schon.") };
  if (error?.code === "teacher_has_code") return { short: translate("Das Kürzel gehört zu einem Lehrer-Code und lässt sich nicht ändern.") };
  const field = error?.details?.fields?.[0]?.field;
  if (error?.status === 422 && ["short", "name", "subjects"].includes(field)) return { [field]: error.message };
  return { message: error?.message };
}

// Был ли учитель из плана тронут: тогда есть что «zurücksetzen»
export const canReset = (teacher) => teacher.source !== "eigen" && (teacher.source === "angepasst" || Boolean(teacher.name) || teacher.hidden);
// Свой учитель удаляется, учитель из плана — только скрывается
export const canDelete = (teacher) => teacher.source === "eigen";
