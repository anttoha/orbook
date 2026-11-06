import { useRef } from "react";

const DELAY = 500; // мс: стільки тримати палець
const MOVE = 10; // px: якщо палець поїхав (гортання), це не довге натискання

// ─────────────────────────────────────────────────────────────
// Довге натискання пальцем (телефон). Повертає обробники для елемента.
// Після довгого натискання наступний click гасимо: інакше відкрилось би ще й посилання.
// Права кнопка миші й Android (contextmenu) — теж onLongPress.
// ─────────────────────────────────────────────────────────────
export function useLongPress(onLongPress) {
  const timer = useRef(null);
  const start = useRef(null);
  const fired = useRef(false);

  const cancel = () => {
    clearTimeout(timer.current);
    timer.current = null;
  };

  return {
    onPointerDown: (event) => {
      if (event.pointerType !== "touch") return;
      fired.current = false;
      start.current = { x: event.clientX, y: event.clientY };
      timer.current = setTimeout(() => {
        fired.current = true;
        onLongPress();
      }, DELAY);
    },
    onPointerMove: (event) => {
      if (timer.current && Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > MOVE) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onContextMenu: (event) => {
      event.preventDefault(); // системне меню посилання не потрібне
      cancel();
      if (!fired.current) onLongPress();
      fired.current = true;
    },
    onClick: (event) => {
      if (fired.current) event.preventDefault();
      fired.current = false;
    },
  };
}
