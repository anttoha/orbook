import { cn } from "../../shared/utils/cn";

// Полоска прогресса (Lernplan, часть 41): песочная дорожка, акцентная заливка.
// Ширина меняется плавно — видно, как план «растёт» после галочки
const ProgressBar = ({ done, total, className }) => (
  <div className={cn("h-2 overflow-hidden rounded-full bg-sand", className)} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
    <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-soft" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
  </div>
);

export default ProgressBar;
