import { useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Жест вкладки-группы (часть 35): палец на вкладке → меню сразу открыто;
// ведёшь вверх — пункт под пальцем подсвечен (hover); отпустил на пункте — onPick(путь).
// Отпустил на месте, не двигая, — обычное нажатие: меню открыто (второе нажатие закрывает).
// Отпустил мимо — меню закрылось. Клавиатура (Enter/Пробел) — тот же toggle через onClick.
// setPointerCapture: события пальца приходят к вкладке, даже когда он уже над меню
// ─────────────────────────────────────────────────────────────
const MOVE = 8; // px: меньше — это ещё нажатие, а не жест

const itemAt = (x, y) => document.elementFromPoint(x, y)?.closest("[data-nav-item]")?.dataset.navItem ?? null;

export function useGroupPress({ open, setOpen, onPick }) {
  const [hover, setHover] = useState(null);
  const press = useRef(null);

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    press.current = { x: event.clientX, y: event.clientY, moved: false, wasOpen: open };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setOpen(true);
  };

  const onPointerMove = (event) => {
    const p = press.current;
    if (!p) return;
    if (Math.hypot(event.clientX - p.x, event.clientY - p.y) > MOVE) p.moved = true;
    if (p.moved) setHover(itemAt(event.clientX, event.clientY));
  };

  const onPointerUp = (event) => {
    const p = press.current;
    press.current = null;
    setHover(null);
    if (!p) return;
    const target = p.moved ? itemAt(event.clientX, event.clientY) : null;
    if (target) onPick(target);
    else if (p.moved || p.wasOpen) setOpen(false);
  };

  const onPointerCancel = () => {
    press.current = null;
    setHover(null);
  };

  // Enter / Пробел с клавиатуры (у нажатия пальцем или мышью detail > 0 — его уже обработал жест)
  const onClick = (event) => {
    if (event.detail === 0) setOpen(!open);
  };

  return { hover, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClick, onContextMenu: (e) => e.preventDefault() } };
}
