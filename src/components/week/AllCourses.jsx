import { Layers } from "lucide-react";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Режим «Alle Kurse» (частина 22): показати весь план класу, не змінюючи «Meine Kurse».
// Кнопка: round — кругла біля «Liste / Zeitleiste» у дні (телефон), pill — з підписом у шапці на ПК.
// Вимкнено — біла, як інші кнопки; увімкнено — фіолетова.
// ─────────────────────────────────────────────────────────────
export const AllCoursesButton = ({ variant = "round", className }) => {
  const on = useUserStore((s) => s.allCourses);
  const setAllCourses = useUserStore((s) => s.setAllCourses);
  const pill = variant === "pill";

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={pill ? undefined : "Alle Kurse zeigen"}
      title="Alle Kurse der Klasse zeigen"
      onClick={() => setAllCourses(!on)}
      className={cn(
        "flex shrink-0 items-center justify-center gap-2 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
        pill ? "h-9 px-3.5 text-label font-bold" : "size-9.5",
        on ? "bg-accent text-on-accent" : "bg-card text-ink hover:bg-sand",
        className,
      )}
    >
      <Layers className="size-4.25 shrink-0" />
      {pill && "Alle Kurse"}
    </button>
  );
};

// Підказка під сіткою, поки режим увімкнено: «Gestrichelt: nicht in deinen Kursen»
export const AllCoursesLegend = ({ className }) => {
  const on = useUserStore((s) => s.allCourses);
  if (!on) return null;

  return (
    <p className={cn("flex items-center gap-2 text-caption text-faint", className)}>
      <span aria-hidden="true" className="h-3 w-4 shrink-0 rounded-tag border border-dashed border-faint2" />
      Gestrichelt: nicht in deinen Kursen
    </p>
  );
};
