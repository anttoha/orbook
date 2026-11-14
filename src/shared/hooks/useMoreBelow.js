import { useCallback, useEffect, useState } from "react";
import { moreBelow, scrollStep } from "../utils/scrollMore";

// Следит, есть ли ниже содержимое: element — прокручиваемый блок, null — вся страница (window).
// Пересчёт — при прокрутке, изменении размера окна и самого содержимого (данные догрузились)
export function useMoreBelow(element, { onlyAtTop = false, enabled = true } = {}) {
  const [more, setMore] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const box = element ?? document.scrollingElement;
    if (!box) return undefined;
    const source = element ?? window;
    const check = () => setMore(moreBelow(box, { onlyAtTop }));
    check();
    source.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    // размер содержимого меняется, когда догружаются данные: следим за каждым блоком внутри
    const observer = new ResizeObserver(check);
    for (const child of element ? element.children : [document.body]) observer.observe(child);
    const late = setTimeout(check, 350); // окно ещё «въезжает» — проверить, когда встанет на место
    return () => {
      clearTimeout(late);
      source.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      observer.disconnect();
    };
  }, [element, onlyAtTop, enabled]);

  // Плавно вниз почти на экран (без анимации, если в системе «меньше движения»)
  const scrollDown = useCallback(() => {
    const box = element ?? document.scrollingElement;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (element ?? window).scrollBy({ top: scrollStep(box.clientHeight), behavior: calm ? "auto" : "smooth" });
  }, [element]);

  return { more: enabled && more, scrollDown };
}
