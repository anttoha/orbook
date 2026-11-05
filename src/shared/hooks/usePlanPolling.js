import { useEffect } from "react";
import { usePlanStore } from "../store/planStore";

const POLL_MS = 10_000;

// Кожні 10 секунд питаємо сервер, чи змінився план, але лише поки вкладку видно:
// у фоні нікого не турбуємо, а повернувшись на вкладку, перевіряємо одразу.
export const usePlanPolling = (enabled) => {
  const checkStatus = usePlanStore((s) => s.checkStatus);

  useEffect(() => {
    if (!enabled) return undefined;
    const check = () => {
      if (document.visibilityState === "visible") checkStatus();
    };
    const id = setInterval(check, POLL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, [enabled, checkStatus]);
};
