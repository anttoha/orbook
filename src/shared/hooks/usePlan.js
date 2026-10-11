import { useEffect } from "react";
import { usePlanStore } from "../store/planStore";
import { useUserStore } from "../store/userStore";
import { isWeekend, mondayOf, visibleLessons } from "../utils/format";
import { weekendDay } from "../utils/lessons";

// ─────────────────────────────────────────────────────────────
// Хуки для даних плану. Самі завантажують тиждень, якщо його ще немає.
// ─────────────────────────────────────────────────────────────

// Тиждень за понеділком: { status, data, savedAt, error }
//   status: "loading" | "ready" | "offline" | "unavailable" | "error"
//   data:   відповідь GET /api/week (days[5], summary, …) або null
export const useWeek = (monday) => {
  const week = usePlanStore((s) => s.weeks[monday]);
  const loadWeek = usePlanStore((s) => s.loadWeek);

  useEffect(() => {
    // вантажимо, тільки якщо цього тижня ще не просили
    if (monday && !usePlanStore.getState().weeks[monday]) loadWeek(monday);
  }, [monday, loadWeek]);

  return week ?? { status: "loading", data: null };
};

// День: { status, day, week }. day — об'єкт дня з тижня (як GET /api/day) або null, поки вантажиться
export const useDay = (iso) => {
  const week = useWeek(iso ? mondayOf(iso) : null); // день береться з уже завантаженого тижня
  // Sa/So сервер у тижні не віддає — складаємо «вільний» день самі
  if (iso && isWeekend(iso)) return { status: "ready", day: weekendDay(iso), week };
  const day = week.data?.days.find((d) => d.date === iso) ?? null;
  return { status: week.status, day, week };
};

// Фільтр «Meine Kurse»: const filter = useLessonFilter(); filter(day.lessons)
export const useLessonFilter = () => {
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const set = new Set(picked);
  return (lessons) => visibleLessons(lessons, courses, set);
};
