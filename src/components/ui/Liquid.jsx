import { useRef } from "react";
import { useLiquid } from "../../shared/hooks/useLiquid";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Наш элемент, который в «Glas» (часть 30a) становится стеклом библиотеки liquid-glass:
//   as      — что рисовать: Link, "button", "div" …;
//   refract — стекло с преломлением (карточки, плитки); без него — только «тянучесть» (пункты меню);
//   press   — раздувается и тянется за пальцем (по умолчанию да).
// В Soft и Klar — тот же элемент с тем же className, как раньше. В «Glas» у стекла фон из библиотеки,
// поэтому наш bg-card тогда снимается.
// ─────────────────────────────────────────────────────────────
const Liquid = ({ as: Tag = "div", refract = false, press = true, className, ...props }) => {
  const self = useRef(null);
  const glass = useLiquid(self, { refract, press, lean: refract ? 6 : 4, stretch: refract ? 0.06 : 0.08 });
  const look = glass && refract ? cn(className?.replace(/\bbg-card(\/\d+)?\b|\bhover:bg-card\/\d+\b/g, ""), "lg-glass orb-liquid") : className;
  return <Tag ref={self} className={look} {...props} />;
};

export default Liquid;
