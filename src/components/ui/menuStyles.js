// Спільні класи для випадаючого меню («⋮» тижня) і контекстного меню уроку.
// Radix ставить атрибути data-state / data-highlighted — за ними й стилізуємо.

// Саме меню (біла картка з тінню)
export const menuContentClass =
  "z-50 min-w-60 overflow-hidden rounded-2xl border border-hair bg-card p-1.5 text-ink shadow-xl shadow-ink/10 data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in";

// Пункт меню; data-highlighted — наведення мишкою або вибір стрілками
export const menuItemClass =
  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-bold outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-40 data-highlighted:bg-sand";

// Іконка в пункті меню
export const menuIconClass = "size-4.5 shrink-0 text-muted";

// Розділювач між групами пунктів
export const menuSeparatorClass = "my-1 h-px bg-hair";
