import { cn } from "../../shared/utils/cn";

// Текст задачи: у сделанной — бледный и зачёркнутый. Линия — отдельная полоска,
// поэтому её можно анимировать: она «протягивается» слева направо (обычный line-through так не умеет)
const DoneText = ({ done, className, children }) => (
  <span className={cn("relative inline-block max-w-full truncate align-top transition-colors duration-300", done ? "text-faint" : "text-ink", className)}>
    {children}
    {done && <span aria-hidden="true" className="absolute top-1/2 left-0 h-px w-full origin-left bg-faint motion-safe:animate-strike" />}
  </span>
);

export default DoneText;
