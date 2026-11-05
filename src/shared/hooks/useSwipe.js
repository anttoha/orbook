import { useRef } from "react";
import { swipeDirection } from "../utils/swipe";

// Обробники для елемента: <section {...useSwipe({ onLeft, onRight })}>
export const useSwipe = ({ onLeft, onRight }) => {
  const start = useRef(null);

  return {
    onTouchStart: (event) => {
      const touch = event.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd: (event) => {
      if (!start.current) return;
      const touch = event.changedTouches[0];
      const direction = swipeDirection(touch.clientX - start.current.x, touch.clientY - start.current.y);
      start.current = null;
      if (direction === "left") onLeft();
      if (direction === "right") onRight();
    },
  };
};
