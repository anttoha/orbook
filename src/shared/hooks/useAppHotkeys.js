import { useLocation, useNavigate } from "react-router-dom";
import { usePlanStore } from "../store/planStore";
import { useHotkeys } from "./useHotkeys";
import { useNow } from "./useNow";
import { useSheet } from "./useSheet";

// День зі сторінки /tag/2026-10-07 — щоб «N» писав нотатку саме до нього
const dayFromPath = (pathname) => pathname.match(/^\/tag\/(\d{4}-\d{2}-\d{2})$/)?.[1] ?? null;

// ─────────────────────────────────────────────────────────────
// Клавіші, що працюють на будь-якій сторінці (вікно «Tastenkürzel», макет 52).
// Клавіші однієї сторінки (← →, T, L, Z) живуть у самій сторінці, ⌘K — у пошуку, ⌘B — у сайдбарі.
// ─────────────────────────────────────────────────────────────
export const useAppHotkeys = (enabled) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { openSheet } = useSheet();
  const { today } = useNow();
  const refreshPlan = usePlanStore((s) => s.refreshPlan);

  useHotkeys(
    {
      "?": () => openSheet("tasten"),
      w: () => navigate("/woche"),
      d: () => navigate("/heute"),
      n: () => openSheet("notiz", { datum: dayFromPath(pathname) ?? today }),
      k: () => navigate("/testen/neu"),
      r: refreshPlan,
    },
    enabled,
  );
};
