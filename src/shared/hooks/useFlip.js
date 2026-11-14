import { useLayoutEffect, useRef } from "react";

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

// Сейчас «Animationen: Voll»? (атрибут data-motion на <html> ставит useAppearance, часть 30a)
const fullMotion = () => document.documentElement.dataset.motion === "voll";

// ─────────────────────────────────────────────────────────────
// Плавная перестановка детей контейнера (приём FLIP): после каждой перерисовки меряем,
// где теперь каждый ребёнок с data-flip="id", и если он сдвинулся — сначала ставим его
// на старое место (transform), а потом плавно ведём на новое. Так анимируются сразу все случаи:
// перетаскивание, смена размера, добавить и убрать блок (соседи разъезжаются).
// Новый ребёнок появляется с лёгким увеличением. «Animationen: Weniger / Aus» — без движения.
// Меряем offsetLeft/offsetTop (от контейнера), а не по экрану — прокрутка страницы не считается сдвигом.
// key — что изменилось (например, порядок и размеры блоков строкой)
// ─────────────────────────────────────────────────────────────
export function useFlip(ref, key) {
  const places = useRef(null); // { id: { x, y, w, h } } после прошлой перерисовки

  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;
    const before = places.current;
    const now = {};
    for (const child of box.children) {
      const id = child.dataset.flip;
      if (!id) continue;
      now[id] = { x: child.offsetLeft, y: child.offsetTop, w: child.offsetWidth, h: child.offsetHeight };
      if (!before || !fullMotion()) continue; // первый показ — блоки появляются своей анимацией
      const old = before[id];
      if (!old) {
        child.animate([{ opacity: 0, transform: "scale(0.94)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: EASE });
        continue;
      }
      const dx = old.x - now[id].x;
      const dy = old.y - now[id].y;
      const resized = old.w !== now[id].w || old.h !== now[id].h;
      if (dx || dy) child.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 280, easing: EASE });
      else if (resized) child.animate([{ transform: "scale(0.97)" }, { transform: "none" }], { duration: 240, easing: EASE });
    }
    places.current = now;
  }, [ref, key]);
}
