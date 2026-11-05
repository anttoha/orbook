import { useEffect, useState } from "react";
import { api } from "../api/api";
import { usePlanStore } from "../store/planStore";
import { isExamId } from "../utils/exams";

// Минулі Klausuren: запитуємо лише тоді, коли учень увімкнув «Vergangene anzeigen»
export const usePastExams = (enabled) => {
  const loadPastExams = usePlanStore((s) => s.loadPastExams);

  useEffect(() => {
    if (enabled) loadPastExams();
  }, [enabled, loadPastExams]);
};

// Одна Klausur за номером з адреси: { exam, status }, status: "loading" | "ready" | "missing" | "error".
// Зазвичай вона вже є у завантажених списках. Запит потрібен, коли вікно відкрили за посиланням
export const useExam = (id) => {
  const known = usePlanStore((s) => [...s.exams, ...s.pastExams.exams].find((exam) => String(exam.id) === id)) ?? null;
  const [fetched, setFetched] = useState({ id: null, exam: null, error: null });
  const valid = isExamId(id);
  const needed = valid && !known;

  useEffect(() => {
    if (!needed) return undefined;
    const controller = new AbortController(); // вікно закрили або інша Klausur: відповідь уже не потрібна
    api(`/exams/${id}`, { signal: controller.signal })
      .then((exam) => setFetched({ id, exam, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) setFetched({ id, exam: null, error });
      });
    return () => controller.abort();
  }, [id, needed]);

  if (known) return { exam: known, status: "ready" };
  if (!valid) return { exam: null, status: "missing" };
  if (fetched.id !== id) return { exam: null, status: "loading" };
  if (fetched.exam) return { exam: fetched.exam, status: "ready" };
  return { exam: null, status: fetched.error?.status === 404 ? "missing" : "error", error: fetched.error };
};
