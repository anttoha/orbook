import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// Гарячі клавіші. Приклад:
//   useHotkeys({ t: goToday, arrowleft: prevWeek, "mod+k": focusSearch })
// Ключ — event.key малими літерами; "mod+" = ⌘ на Mac або Ctrl на Windows.
// Поки курсор у полі вводу або відкрите вікно/меню — клавіші без mod не спрацьовують.
// ─────────────────────────────────────────────────────────────
export const useHotkeys = (bindings, enabled = true) => {
  const ref = useRef(bindings); // останні обробники (без переписки на кожен рендер)

  // Оновлюємо ref після рендера (а не під час нього — так вимагає React)
  useEffect(() => {
    ref.current = bindings;
  });

  useEffect(() => {
    if (!enabled) return; // вимкнено — не слухаємо

    const onKeyDown = (event) => {
      const key = event.key.toLowerCase(); // "t", "arrowleft", "k"…
      const mod = event.metaKey || event.ctrlKey; // ⌘ або Ctrl
      const name = mod ? `mod+${key}` : key; // назва сполучення

      if (!mod) {
        if (event.altKey || event.shiftKey) return; // Alt/Shift — не наші сполучення
        const target = event.target; // де зараз фокус
        const typing = target.closest?.("input, textarea, select, [contenteditable=true]"); // друкує в полі
        const overlay = document.querySelector("[role=dialog], [role=menu]"); // відкрите вікно або меню
        if (typing || overlay) return; // не заважаємо вводу і вікнам
      }

      const handler = ref.current[name]; // чи є обробник
      if (!handler) return;
      event.preventDefault(); // скасовуємо дію браузера (наприклад, ⌘K)
      handler(event);
    };

    window.addEventListener("keydown", onKeyDown); // слухаємо всю сторінку
    return () => window.removeEventListener("keydown", onKeyDown); // відписка
  }, [enabled]);
};
