import { useEffect, useState } from "react";
import { api } from "../api/api";
import { usePlanStore } from "../store/planStore";

// ─────────────────────────────────────────────────────────────
// Дни недели для «Plan-Status» (часть 26): GET /api/week?date=<monday> — отдельно от planStore,
// чтобы экран недели не обновился раньше, чем ученик нажмёт «Ansehen» у «Neuer Plan».
// Перечитываем после каждой проверки школы (status.lastFetchAt) и после «jetzt prüfen» (planStamp).
// → { state: "loading" | "ready" | "error", days }
// ─────────────────────────────────────────────────────────────
export const useWeekCheck = (monday, enabled = true) => {
  const lastFetchAt = usePlanStore((s) => s.status?.lastFetchAt);
  const stamp = usePlanStore((s) => s.planStamp);
  const [result, setResult] = useState({ monday, state: "loading", days: [] });

  useEffect(() => {
    if (!enabled || !monday) return undefined;
    let alive = true;
    api(`/week?date=${monday}`)
      .then((week) => alive && setResult({ monday, state: "ready", days: week?.days ?? [] }))
      .catch(() => alive && setResult((prev) => (prev.monday === monday && prev.days.length ? prev : { monday, state: "error", days: [] })));
    return () => {
      alive = false;
    };
  }, [monday, enabled, lastFetchAt, stamp]);

  return result.monday === monday ? result : { monday, state: "loading", days: [] };
};
