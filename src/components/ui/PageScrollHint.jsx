import { useMoreBelow } from "../../shared/hooks/useMoreBelow";
import { cn } from "../../shared/utils/cn";
import ScrollDownButton from "./ScrollDownButton";

// ─────────────────────────────────────────────────────────────
// Кнопка «вниз» для всей страницы (часть 29d).
// onlyAtTop — обычные страницы телефона: видна, пока не начали листать, и над нижним меню.
// Без него (выбор курсов при первом входе) — видна, пока не долистали до кнопок внизу.
// ─────────────────────────────────────────────────────────────
const PageScrollHint = ({ onlyAtTop = false, className }) => {
  const { more, scrollDown } = useMoreBelow(null, { onlyAtTop });
  return (
    <div className={cn("pointer-events-none fixed inset-x-0 z-30 flex justify-center", className)}>
      <ScrollDownButton show={more} onClick={scrollDown} />
    </div>
  );
};

export default PageScrollHint;
