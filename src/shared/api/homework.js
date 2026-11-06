// ─────────────────────────────────────────────────────────────
// homework.js — запис Hausaufgaben (docs/API.md «Hausaufgaben»). Влаштовано як exams.js:
// PATCH і DELETE з версією (If-Match), 409 conflict — запис уже змінили.
// ─────────────────────────────────────────────────────────────
import { api, ifMatch } from "./api";

// Зберегти форму. Без existing — створити, з existing — змінити.
//   { status: "saved", item }  або  { status: "conflict", current }
// Решта помилок (403, 422, мережа) летить далі. Дублікатів у Hausaufgaben немає
export async function saveHomework(form, existing = null) {
  try {
    const item = existing ? await api(`/homework/${existing.id}`, { method: "PATCH", body: form, headers: ifMatch(existing.version) }) : await api("/homework", { method: "POST", body: form });
    return { status: "saved", item };
  } catch (error) {
    if (error.code === "conflict") return { status: "conflict", current: error.details.current };
    throw error;
  }
}

export const deleteHomework = (item) => api(`/homework/${item.id}`, { method: "DELETE", headers: ifMatch(item.version) });

// «Rückgängig» після видалення
export const restoreHomework = (item) => api(`/homework/${item.id}/restore`, { method: "POST" });

// «Verlauf» запису: kind — "homework" або "exams". Відповідь { changes: [...] }, нові зверху
export const loadHistory = (kind, id, signal) => api(`/${kind}/${id}/history`, { signal });
