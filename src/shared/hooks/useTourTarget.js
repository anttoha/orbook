import { useEffect, useState } from "react";
import { PAD, spotRect, WAIT_MS } from "../utils/tour";

// Первый элемент с меткой data-tour из списка, который сейчас виден (у скрытых — нулевой размер)
const findTarget = (names) => {
  for (const name of names) {
    const el = [...document.querySelectorAll(`[data-tour="${name}"]`)].find((node) => node.getClientRects().length > 0);
    if (el) return el;
  }
  return null;
};

// Радиус прожектора — как у самого элемента (+ отступ), но не больше половины высоты
const radiusOf = (el, spot) => Math.min(spot.h / 2, (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0) + PAD);

const same = (a, b) => a === b || (a && b && ["x", "y", "w", "h", "r"].every((k) => Math.round(a[k]) === Math.round(b[k])));

// ─────────────────────────────────────────────────────────────
// Rundgang (часть 52): где сейчас элемент шага. Каждый кадр меряем его (страница прокручивается,
// план догружается, панель меняет размер) и обновляем состояние только когда рамка правда сдвинулась.
// Элемента нет дольше WAIT_MS — onMissing (шаг пропускаем). Нашли впервые — прокручиваем к нему.
// ─────────────────────────────────────────────────────────────
export const useTourTarget = (names, active, onMissing) => {
  const [spot, setSpot] = useState(null);

  useEffect(() => {
    if (!active) return undefined;
    const since = performance.now();
    let frame = 0;
    let scrolled = false;
    let gone = false;
    const tick = () => {
      const el = findTarget(names);
      if (!el) {
        if (!gone && performance.now() - since > WAIT_MS) {
          gone = true;
          onMissing();
        }
      } else {
        if (!scrolled) {
          scrolled = true;
          const box = el.getBoundingClientRect();
          if (box.top < 0 || box.bottom > window.innerHeight) el.scrollIntoView({ block: "center" });
        }
        const rect = spotRect(el.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight });
        const next = { ...rect, r: radiusOf(el, rect) };
        setSpot((prev) => (same(prev, next) ? prev : next));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [names, active]); // eslint-disable-line react-hooks/exhaustive-deps -- onMissing меняется каждый рендер, а цикл должен жить весь шаг

  return spot;
};
