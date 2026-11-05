import { RefreshCw } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { changedLabel } from "../../shared/utils/format";

// Другий рядок плашки дня: іконка оновлення і час зміни плану.
// Місце під рядок є завжди, навіть без часу: так плашки однакові й дата не стрибає.
// className — розмір тексту і висота рядка: на телефоні й на ПК вони різні.
const ChangedLine = ({ day, isToday, className }) => {
  const label = changedLabel(day);

  return (
    <span aria-label={label ? `geändert ${label}` : undefined} className={cn("flex items-center gap-0.5 overflow-hidden whitespace-nowrap", isToday ? "text-on-accent/70" : "text-faint", className)}>
      {label && (
        <>
          <RefreshCw aria-hidden="true" className="size-2 shrink-0" strokeWidth={2.5} />
          <span className="truncate">{label}</span>
        </>
      )}
    </span>
  );
};

export default ChangedLine;
