import { useEffect, useState } from "react";
import { usePlanStore } from "../store/planStore";

// Часы школы, которые тикают каждые `ms` (по умолчанию 5 с) — для «geprüft vor 20 Sek.».
// Общий «now» в planStore обновляется раз в минуту: для секунд этого мало. → миллисекунды
export const useTicker = (ms = 5000) => {
  const clock = usePlanStore((s) => s.clock);
  const [now, setNow] = useState(() => clock.now().getTime());
  useEffect(() => {
    const id = setInterval(() => setNow(clock.now().getTime()), ms);
    return () => clearInterval(id);
  }, [clock, ms]);
  return now;
};
