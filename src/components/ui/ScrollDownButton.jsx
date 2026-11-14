import { ChevronDown } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Круглая кнопка со стрелкой вниз: «ниже есть ещё» (владелец 14.11).
// show — есть ли что листать; появляется и прячется плавно (сдвиг + прозрачность), стрелка слегка «кивает».
// className — где стоит (sticky внизу шторки, fixed над нижним меню телефона …)
// ─────────────────────────────────────────────────────────────
const ScrollDownButton = ({ show, onClick, className }) => {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("Weiter nach unten")}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={cn(
        "grid size-11 place-items-center rounded-full bg-card text-ink shadow-menu outline-none transition-[opacity,translate,scale] duration-200 ease-soft focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-95 motion-reduce:transition-none",
        show ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        className,
      )}
    >
      <ChevronDown className="size-5 motion-safe:animate-nudge-down" />
    </button>
  );
};

export default ScrollDownButton;
