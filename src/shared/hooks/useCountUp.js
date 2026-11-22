import { useEffect, useState } from "react";
import { motionMs } from "../utils/motion";

// Число «считает» от 0 до target за ms (итог «Geschafft!», часть 43). Без анимаций — сразу target
export function useCountUp(target, ms = 700) {
  const [value, setValue] = useState(() => (motionMs(ms) === 0 ? target : 0));
  useEffect(() => {
    const duration = motionMs(ms);
    if (duration === 0) return undefined;
    let frame = 0;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - (1 - p) ** 3))); // быстро в начале, мягко в конце
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame); // ушли с экрана — больше не считаем
  }, [target, ms]);
  return value;
}
