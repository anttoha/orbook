import { useEffect, useRef, useState } from "react";

// Після забагатьох неправильних паролів сервер дає паузу (429 locked, retryAfter).
// locked — чи кнопка зараз вимкнена; lockFor(ms) — вимкнути на ms (0 — нічого не робити)
export function useLockTimer() {
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []); // сторінку закрили — таймер не потрібен

  const lockFor = (ms) => {
    if (!ms) return;
    setLocked(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(false), ms);
  };
  return { locked, lockFor };
}
