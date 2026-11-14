import { useState } from "react";
import { Drawer } from "vaul";
import { GlassSheet } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useMoreBelow } from "../../shared/hooks/useMoreBelow";
import Kbd from "./Kbd";
import RoundButton from "./RoundButton";
import ScrollDownButton from "./ScrollDownButton";

// ─────────────────────────────────────────────────────────────
// Спільна шторка.
//   Телефон (< 1024px) — шторка знизу (vaul): з «ручкою», змахується вниз.
//   Комп'ютер (≥ 1024px) — залежить від desktop:
//     "panel"  — панель праворуч на всю висоту (урок, Info zum Tag) — як на макеті
//     "dialog" — вікно по центру (Teilen, календар)
//     "wide"   — широке вікно по центру (Tastenkürzel)
//     "qr"     — вікно 620px: QR і кнопки поруч («Einladen», частина 16)
// Обидві бібліотеки самі дають: затемнення, Esc, клік по фону, фокус усередині.
//
// Пропси:
//   open, onClose — чи відкрита шторка і що робити при закритті
//   desktop       — "panel" | "dialog" (вигляд на комп'ютері)
//   panelLabel    — маленький підпис на самому верху панелі («Stunde»)
//   eyebrow       — рядок над заголовком
//   title         — заголовок (обов'язковий для скрінрідерів)
//   titleAside    — щось праворуч від заголовка (наприклад, бейдж)
//   titleClassName — колір заголовка (окно уроку: колір предмета)
//   hideClose     — без хрестика на телефоні (вікно уроку за макетом: закривається змахом і кліком по фону)
//   icon          — кружечок ліворуч від заголовка
//   footer        — кнопки внизу
// ─────────────────────────────────────────────────────────────
const Sheet = ({ open, onClose, desktop = "panel", panelLabel, eyebrow, title, titleAside, titleClassName, hideClose = false, icon, footer, children }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY); // який варіант показувати
  const isPanel = isDesktop && desktop === "panel"; // панель праворуч?
  const glass = useGlass(); // «Glas» на телефоні — шторка з бібліотеки liquid-glass
  const dialogWidth = { wide: "w-dialog-wide", qr: "w-dialog-qr" }[desktop] ?? "w-dialog"; // ширина вікна по центру
  // Часть 29d: ниже есть ещё — кнопка «вниз» внизу шторки. scroller — блок, который прокручивается
  const [scroller, setScroller] = useState(null);
  const { more, scrollDown } = useMoreBelow(scroller, { enabled: open });
  // Лежит поверх прокручиваемой части у нижнего края окна (сам блок окна не прокручивается)
  const downButton = (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-10 flex justify-center">
      <ScrollDownButton show={more} onClick={scrollDown} />
    </div>
  );

  // Бібліотеки повідомляють про відкриття/закриття через onOpenChange(true/false)
  const handleOpenChange = (next) => {
    if (!next) onClose(); // закрили (Esc, фон, змах) — повідомляємо нагору
  };

  // Хрестик (+ підказка «Esc» на комп'ютері)
  // «Glas»: крестик — кнопка библиотеки; закрывает напрямую через onClose
  const renderClose = (Close) => glass ? (
    <div className="flex shrink-0 items-center gap-2">
      {isDesktop && <Kbd>Esc</Kbd>}
      <RoundButton aria-label="Schließen" onClick={onClose}>
        <X className="size-4" />
      </RoundButton>
    </div>
  ) : (
    <div className="flex shrink-0 items-center gap-2">
      {isDesktop && <Kbd>Esc</Kbd>}
      <Close
        aria-label="Schließen"
        className="grid size-8.5 place-items-center rounded-full bg-card text-ink transition-colors outline-none hover:bg-sand focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <X className="size-4" />
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
            <Title className={cn("text-heading font-black text-ink", isPanel && "text-sheet", titleClassName)}>{title}</Title>
            {titleAside}
          </div>
        </div>
        {!isPanel && !(hideClose && !isDesktop) && renderClose(Close)}
      </header>
    </>
  );

  // Вміст без шапки
  const body = (
    <>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
      {footer && <div className="mt-3.5 flex flex-wrap gap-2 lg:mt-5 lg:gap-2.5">{footer}</div>}
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
              // окно не прокручивается само и обрезает углы — прокрутка внутри (полоса не лезет в скругление)
              "fixed z-50 flex flex-col overflow-hidden bg-paper shadow-sheet outline-none",
              isPanel
                ? // панель: праворуч, відступ 16px від країв екрана, ширина 440px (як на макеті)
                  "top-4 right-4 bottom-4 w-sheet max-w-[calc(100%-2rem)] rounded-panel data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right"
                : // вікно: по центру, ширина 520px
                  cn("top-1/2 left-1/2 max-w-[calc(100%-2rem)] -translate-1/2 rounded-panel data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in", dialogWidth),
            )}
          >
            {/* высоту ограничивает сама прокручиваемая часть (окно по центру — до 85 % экрана) */}
            <div ref={setScroller} className={cn("min-h-0 flex-1 overflow-y-auto scroll-stable p-6.5", !isPanel && "max-h-[85dvh]")}>
              {renderHeader(Dialog.Title, Dialog.Description, Dialog.Close)}
              {body}
            </div>
            {downButton}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // ── Телефон, «Glas»: стеклянная шторка библиотеки — выезжает пружиной, смахивается вниз.
  // Заголовок тот же; вместо примитивов vaul — обычные h2/p и кнопка, которая закрывает шторку
  if (glass) {
    const PlainClose = (props) => <button type="button" onClick={onClose} {...props} />;
    return (
      <GlassSheet open={open} onClose={onClose} aria-label={typeof title === "string" ? title : eyebrow}>
        <div ref={setScroller} className="max-h-[80dvh] min-h-0 overflow-y-auto scroll-stable pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {renderHeader("h2", "p", PlainClose)}
          {body}
        </div>
        {downButton}
      </GlassSheet>
    );
  }

  // ── Телефон: шторка знизу ──
  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        {/* затемнення фону */}
        <Drawer.Overlay className="fixed inset-0 z-40 bg-overlay" />
        {/* шторка притиснута донизу; vaul сам анімує виїзд і змах */}
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-panel bg-paper outline-none">
          {/* «ручка» зверху — за неї зручно тягнути */}
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-9.5 shrink-0 rounded-full bg-faint2" />
          {/* прокручувана частина; знизу враховуємо смужку жестів iPhone */}
          <div ref={setScroller} className="min-h-0 overflow-y-auto scroll-stable px-gutter pt-3 pb-[calc(1.875rem+env(safe-area-inset-bottom))]">
            {renderHeader(Drawer.Title, Drawer.Description, Drawer.Close)}
            {body}
          </div>
          {downButton}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default Sheet;
