import { useEffect } from "react";
import { usePlanStore } from "../store/planStore";

// «Зараз» за часом школи (рядок «зараз», «noch 27 min», яке сьогодні день).
// Раз на хвилину — і одразу при поверненні у вкладку: у фоні таймер спить (часть 46).
export function useSchoolNow(active) {
  const tick = usePlanStore((s) => s.tick);
  useEffect(() => {
    if (!active) return undefined; // не увійшли — нічого не робимо
    const onVisible = () => document.visibilityState === "visible" && tick();
    const id = setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, tick]);
}
