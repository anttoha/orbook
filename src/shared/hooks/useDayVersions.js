import { useEffect, useState } from "react";
import { api } from "../api/api";
import { usePlanStore } from "../store/planStore";

// Последние ответы по дням: шторка открывается снова — лента видна сразу, а свежая догружается
const remembered = new Map();

// ─────────────────────────────────────────────────────────────
// Fassungen плана дня для «Verlauf des Tages» (часть 26): GET /api/day/versions?date=
// Перечитываем, когда пришло событие «plan» (planStamp). На устройстве не храним: без сети — ошибка.
// → { state: "loading" | "ready" | "error", data, reload }
// ─────────────────────────────────────────────────────────────
export const useDayVersions = (date) => {
  const stamp = usePlanStore((s) => s.planStamp);
  const [result, setResult] = useState({ date, state: "loading", data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!date) return undefined;
    let alive = true; // шторку закрыли до ответа — ответ не нужен
    api(`/day/versions?date=${date}`)
      .then((data) => {
        remembered.set(date, data);
        if (alive) setResult({ date, state: "ready", data });
      })
      .catch(() => alive && setResult({ date, state: "error", data: null }));
    return () => {
      alive = false;
    };
  }, [date, stamp, attempt]);

  const reload = () => {
    setResult({ date, state: "loading", data: null });
    setAttempt((n) => n + 1);
  };
  // пока ответа для этого дня нет — то, что помним, иначе «loading»
  if (result.date !== date || result.state === "loading") {
    const known = remembered.get(date);
    return { state: known ? "ready" : "loading", data: known ?? null, reload };
  }
  return { ...result, reload };
};
