import { Drawer } from "vaul";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import Kbd from "./Kbd";

// ─────────────────────────────────────────────────────────────
// Спільна шторка.
//   Телефон (< 1024px) — шторка знизу (vaul): з «ручкою», змахується вниз.
//   Комп'ютер (≥ 1024px) — залежить від desktop:
//     "panel"  — панель праворуч на всю висоту (урок, Info zum Tag) — як на макеті
//     "dialog" — вікно по центру (Teilen, календар)
// Обидві бібліотеки самі дають: затемнення, Esc, клік по фону, фокус усередині.
//
// Пропси:
//   open, onClose — чи відкрита шторка і що робити при закритті
//   desktop       — "panel" | "dialog" (вигляд на комп'ютері)
//   panelLabel    — маленький підпис на самому верху панелі («Stunde»)
//   eyebrow       — рядок над заголовком
//   title         — заголовок (обов'язковий для скрінрідерів)
//   titleAside    — щось праворуч від заголовка (наприклад, бейдж)
//   icon          — кружечок ліворуч від заголовка
//   footer        — кнопки внизу
// ─────────────────────────────────────────────────────────────
const Sheet = ({ open, onClose, desktop = "panel", panelLabel, eyebrow, title, titleAside, icon, footer, children }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // який варіант показувати
  const isPanel = isDesktop && desktop === "panel"; // панель праворуч?

  // Бібліотеки повідомляють про відкриття/закриття через onOpenChange(true/false)
  const handleOpenChange = (next) => {
    if (!next) onClose(); // закрили (Esc, фон, змах) — повідомляємо нагору
  };

  // Хрестик (+ підказка «Esc» на комп'ютері)
  const renderClose = (Close) => (
    <div className="flex shrink-0 items-center gap-2">
      {isDesktop && <Kbd>Esc</Kbd>}
      <Close
        aria-label="Schließen"
        className="grid size-9 place-items-center rounded-full bg-card text-ink transition-colors outline-none hover:bg-sand focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <X className="size-4.5" />
      </Close>
    </div>
  );

  // Шапка; Title/Description/Close — компоненти потрібної бібліотеки
  const renderHeader = (Title, Description, Close) => (
    <>
      {/* у панелі хрестик в окремому рядку зверху, поруч із panelLabel */}
      {isPanel && (
        <div className="mb-5 flex items-center justify-between">
          <span className="text-label font-extrabold text-faint">{panelLabel}</span>
          {renderClose(Close)}
        </div>
      )}
      <header className="flex items-start gap-3">
        {icon}
        <div className="min-w-0 flex-1">
          {/* Description — підпис для скрінрідера (тут це eyebrow) */}
          <Description className={cn("text-caption font-extrabold text-faint", !eyebrow && "sr-only")}>
            {eyebrow || title}
          </Description>
          <div className="flex flex-wrap items-center gap-2">
            <Title className={cn("text-heading font-black text-ink", isPanel && "text-[30px]")}>{title}</Title>
            {titleAside}
          </div>
        </div>
        {!isPanel && renderClose(Close)}
      </header>
    </>
  );

  // Вміст без шапки
  const body = (
    <>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
      {footer && <div className="mt-5 flex gap-2.5">{footer}</div>}
    </>
  );

  // ── Комп'ютер: панель праворуч або вікно по центру ──
  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          {/* затемнення фону */}
          <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
          <Dialog.Content
            className={cn(
              "fixed z-50 overflow-y-auto bg-paper p-6.5 shadow-2xl outline-none",
              isPanel
                ? // панель: праворуч, відступ 16px від країв екрана, ширина 440px (як на макеті)
                  "top-4 right-4 bottom-4 w-[440px] max-w-[calc(100%-2rem)] rounded-[28px] data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right"
                : // вікно: по центру, ширина 520px
                  "top-1/2 left-1/2 max-h-[85dvh] w-[520px] max-w-[calc(100%-2rem)] -translate-1/2 rounded-[28px] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in",
            )}
          >
            {renderHeader(Dialog.Title, Dialog.Description, Dialog.Close)}
            {body}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // ── Телефон: шторка знизу ──
  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        {/* затемнення фону */}
        <Drawer.Overlay className="fixed inset-0 z-40 bg-overlay" />
        {/* шторка притиснута донизу; vaul сам анімує виїзд і змах */}
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] bg-paper outline-none">
          {/* «ручка» зверху — за неї зручно тягнути */}
          <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-faint2" />
          {/* прокручувана частина; знизу враховуємо смужку жестів iPhone */}
          <div className="overflow-y-auto px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            {renderHeader(Drawer.Title, Drawer.Description, Drawer.Close)}
            {body}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default Sheet;
