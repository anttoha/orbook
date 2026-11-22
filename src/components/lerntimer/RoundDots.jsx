import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// Точки раундов под кольцом: сделано — закрашено (и «впрыгивает»), текущая — кольцом, впереди — серые
const RoundDots = ({ done, total, current, className }) => {
  const t = useT();
  return (
    <div role="img" aria-label={t("Runde {n} von {total}", { n: current ?? done, total })} className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={`${i}-${i < done}`}
          className={cn(
            "size-2.5 rounded-full",
            i < done ? "bg-accent motion-safe:animate-dot-pop" : i === current - 1 ? "border-2 border-accent" : "bg-sand",
          )}
        />
      ))}
    </div>
  );
};

export default RoundDots;
