import { useEffect, useState } from "react";
import { api } from "../api/api";
import { loadWithCache } from "../api/offlineCache";

// День одного класса: план дня, курсы и тесты — с заголовком ЭТОГО класса (api: classId), кеш офлайн — тоже его.
// → { status: "ready" | "offline" | "unavailable" | "error", day, courses, exams }
async function loadClassDay(classId, date, signal) {
  const opts = { classId, signal };
  const optional = (promise) => promise.catch(() => ({ data: null })); // без курсов и тестов день всё равно рисуется
  try {
    const [day, courses, exams] = await Promise.all([
      loadWithCache(`day:${date}`, () => api(`/day?date=${date}`, opts), classId),
      optional(loadWithCache("courses", () => api("/courses", opts), classId)),
      optional(loadWithCache("exams", () => api("/exams", opts), classId)),
    ]);
    return { status: day.status, day: day.data, courses: courses.data?.courses ?? [], exams: exams.data?.exams ?? [] };
  } catch (error) {
    return { status: "error", error };
  }
}

// ─────────────────────────────────────────────────────────────
// Сегодня у одного класса — для карточки «Meine Klassen» (часть 29).
// Каждая карточка грузит свой день сама: медленный класс не держит остальные.
//   → { status: "loading" | "ready" | "offline" | "unavailable" | "error", day, courses, exams }
// classId = null (класс «Zugang beendet») — ничего не грузим. reload — число, «Nochmal» его увеличивает
// ─────────────────────────────────────────────────────────────
export function useClassToday(classId, today, reload = 0) {
  const key = `${classId}|${today}|${reload}`; // для каких данных ответ
  const [result, setResult] = useState({ key: null });

  useEffect(() => {
    if (classId == null || !today) return undefined;
    const controller = new AbortController(); // карточку убрали — запросы больше не нужны
    loadClassDay(classId, today, controller.signal).then((data) => !controller.signal.aborted && setResult({ key, ...data }));
    return () => controller.abort();
  }, [classId, today, key]);

  return result.key === key ? result : { status: "loading" };
}

// ─────────────────────────────────────────────────────────────
// Один день у нескольких классов — «Nebeneinander» (часть 29c). Каждый класс приходит сам по себе:
// пока его нет — { status: "loading" }. → { [classId]: результат как у useClassToday }
// ─────────────────────────────────────────────────────────────
export function useClassDays(classIds, date) {
  const key = `${classIds.join(",")}|${date}`;
  const [state, setState] = useState({ key: null, byId: {} });

  useEffect(() => {
    if (!date) return undefined;
    const controller = new AbortController(); // ушли с вкладки или выбрали другой день
    const ids = key.split("|")[0].split(",").filter(Boolean).map(Number);
    for (const id of ids) {
      loadClassDay(id, date, controller.signal).then((data) => {
        if (!controller.signal.aborted) setState((old) => ({ key, byId: { ...(old.key === key ? old.byId : {}), [id]: data } }));
      });
    }
    return () => controller.abort();
  }, [key, date]);

  const byId = state.key === key ? state.byId : {};
  return Object.fromEntries(classIds.map((id) => [id, byId[id] ?? { status: "loading" }]));
}
