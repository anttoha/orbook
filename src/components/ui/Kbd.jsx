import { cn } from "../../shared/utils/cn";

// Плашка клавіші: <Kbd>Esc</Kbd>, <Kbd>⌘K</Kbd> (як на макеті — рамка, дрібний текст)
const Kbd = ({ className, children }) => (
  <kbd
    className={cn(
      "inline-grid h-5.5 min-w-5.5 shrink-0 place-items-center rounded-md border border-rule bg-card px-1.5 font-sans text-micro font-bold text-muted",
      className,
    )}
  >
    {children}
  </kbd>
);

export default Kbd;
