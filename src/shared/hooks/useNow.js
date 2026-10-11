import { usePlanStore } from "../store/planStore";
import { berlinParts } from "../utils/lessonClock";

// ─────────────────────────────────────────────────────────────
// Поточний час ШКОЛИ (оновлюється раз на хвилину — таймер у HomePage).
//   const { now, today } = useNow();
//   now   — Date (з поправкою з meta.serverTime)
//   today — "2026-10-07" (сьогодні в Берліні; у демо — «вигадане сьогодні»)
// ─────────────────────────────────────────────────────────────
export const useNow = () => {
  const now = usePlanStore((s) => s.now);
  return { now, today: berlinParts(now).date };
};
