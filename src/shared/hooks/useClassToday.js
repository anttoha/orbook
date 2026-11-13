import { useEffect, useState } from "react";
import { api } from "../api/api";
import { loadWithCache } from "../api/offlineCache";

// ─────────────────────────────────────────────────────────────
// Сегодня у одного класса — для карточки «Meine Klassen» (часть 29).
// Каждая карточка грузит свой день сама: медленный класс не держит остальные.
// Запросы идут с заголовком ЭТОГО класса (api: classId), кеш офлайн — тоже его.
//   → { status: "loading" | "ready" | "offline" | "unavailable" | "error", day, courses, exams }
// classId = null (класс «Zugang beendet») — ничего не грузим. reload — число, «Nochmal» его увеличивает
// ─────────────────────────────────────────────────────────────
export function useClassToday(classId, today, reload = 0) {
  const key = `${classId}|${today}|${reload}`; // для каких данных ответ
  const [result, setResult] = useState({ key: null });

  useEffect(() => {
    if (classId == null || !today) return undefined;
    const controller = new AbortController(); // карточку убрали — запросы больше не нужны
    const opts = { classId, signal: controller.signal };
    const optional = (promise) => promise.catch(() => ({ data: null })); // без курсов и тестов карточка всё равно рисуется
    Promise.all([
      loadWithCache(`day:${today}`, () => api(`/day?date=${today}`, opts), classId),
      optional(loadWithCache("courses", () => api("/courses", opts), classId)),
      optional(loadWithCache("exams", () => api("/exams", opts), classId)),
    ])
      .then(([day, courses, exams]) => setResult({ key, status: day.status, day: day.data, courses: courses.data?.courses ?? [], exams: exams.data?.exams ?? [] }))
      .catch((error) => !controller.signal.aborted && setResult({ key, status: "error", error }));
    return () => controller.abort();
  }, [classId, today, key]);

  return result.key === key ? result : { status: "loading" };
}
