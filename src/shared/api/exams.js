// ─────────────────────────────────────────────────────────────
// exams.js — запис Klausuren (з гайду, docs/frontend/04-klausuren.md).
// PATCH і DELETE йдуть з версією (If-Match): так сервер помітить, що запис уже змінили.
// ─────────────────────────────────────────────────────────────
import { api, ifMatch } from "./api";

// Зберегти форму. Без existing — створити, з existing — змінити.
//   { status: "saved", exam }
//   { status: "duplicate", existing } — такий запис уже є: показати і запропонувати force
//   { status: "conflict", current }   — запис уже змінили: показати і дати вибрати
// Решта помилок (403, 422, мережа) летить далі
export async function saveExam(form, existing = null, { force = false } = {}) {
  const body = { ...form, force };
  try {
    const exam = existing ? await api(`/exams/${existing.id}`, { method: "PATCH", body, headers: ifMatch(existing.version) }) : await api("/exams", { method: "POST", body });
    return { status: "saved", exam };
  } catch (error) {
    if (error.code === "duplicate") return { status: "duplicate", existing: error.details.existing };
    if (error.code === "conflict") return { status: "conflict", current: error.details.current };
    throw error;
  }
}

export const deleteExam = (exam) => api(`/exams/${exam.id}`, { method: "DELETE", headers: ifMatch(exam.version) });

// «Rückgängig» після видалення: сервер тримає видалене 30 днів
export const undoDelete = (exam) => api(`/exams/${exam.id}/restore`, { method: "POST" });
