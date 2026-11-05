import { useEffect, useState } from "react";
import { api } from "../api/api";
import { loadWithCache } from "../api/offlineCache";
import { useUserStore } from "../store/userStore";
import { statsPath } from "../utils/stats";

// ─────────────────────────────────────────────────────────────
// Статистика для екрана Statistik (гайд docs/frontend/05-statistik.md).
// Два запити разом: вибраний період (main) і поточний тиждень (week) для стовпчиків «nach Tag».
// У режимі «Woche» це той самий запит, тому він один.
// Результат: { status, main, week, savedAt, error, reload }
//   status як у loadWithCache: "loading" | "ready" | "offline" | "unavailable" | "error"
// ─────────────────────────────────────────────────────────────
export function useStats(range) {
  const picked = useUserStore((s) => s.picked);
  const coursesKey = picked.join(","); // рядок, щоб ефект не перезапускався від нового масиву з тими самими курсами
  const [attempt, setAttempt] = useState(0); // «Erneut versuchen» збільшує — ефект іде ще раз
  const [result, setResult] = useState({ key: null });
  const key = `${range}|${coursesKey}|${attempt}`; // для яких умов отримано result

  useEffect(() => {
    const controller = new AbortController(); // сторінку закрили або змінили період: відповідь уже не потрібна
    const courses = coursesKey ? coursesKey.split(",") : [];
    // кеш окремо для кожного вибору курсів: цифри в них різні
    const load = (r) => loadWithCache(`stats:${r}:${coursesKey}`, () => api(statsPath(r, courses), { signal: controller.signal }));
    const requests = range === "week" ? [load("week")] : [load("month"), load("week")];

    Promise.all(requests)
      .then(([main, week = main]) => {
        if (controller.signal.aborted) return;
        const stale = [main, week].find((r) => r.fromCache); // хоч один зі збереженого — показуємо плашку
        setResult({ key, main: main.data, week: week.data, status: stale?.status ?? "ready", savedAt: stale?.savedAt ?? null, error: stale?.error ?? null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ key, status: "error", error });
      });
    return () => controller.abort();
  }, [key, range, coursesKey]);

  const reload = () => setAttempt((n) => n + 1);
  if (result.key !== key) return { status: "loading", reload };
  return { ...result, reload };
}
