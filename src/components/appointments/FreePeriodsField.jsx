import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import ChipButton from "../ui/ChipButton";
import Field from "../ui/Field";
import { useT } from "../../shared/hooks/useT";

// Номери уроків для вибору: з часу уроків школи (без 0. уроку), інакше 1…8
const lessonNumbers = (lessonTimes) => {
  const numbers = (lessonTimes ?? [])
    .map((time) => time.period)
    .filter((period) => period >= 1);
  return numbers.length > 0 ? numbers : [1, 2, 3, 4, 5, 6, 7, 8];
};

// Вибір як «Ausflug» у формі: вибраний — tint і рамка 2px
const look = (selected, round) =>
  cn(
    "h-9.5 rounded-full border text-label font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    round ? "w-9.5 font-extrabold text-ink" : "px-3.5 text-ink",
    selected ? cn("border-2 border-accent bg-tint", round && "text-accent-ink") : "border-rule",
  );

// ─────────────────────────────────────────────────────────────
// «Unterricht» у формі Termin виду «Frei» (частина 53, макет 53 handy-01…03).
// periods: null — ganzer Tag; масив — лише ці уроки ([] — ще нічого не вибрано → помилка під кнопками)
// ─────────────────────────────────────────────────────────────
const FreePeriodsField = ({ periods, error, onChange }) => {
  const t = useT();
  const lessonTimes = usePlanStore((s) => s.meta?.lessonTimes);
  const some = periods !== null;
  const toggle = (n) =>
    onChange(
      periods.includes(n)
        ? periods.filter((p) => p !== n)
        : [...periods, n].sort((a, b) => a - b),
    );

  return (
    <Field label={t("Unterricht")} error={error}>
      <div className="flex flex-wrap gap-2">
        <ChipButton
          aria-pressed={!some}
          on={!some}
          look={look(!some)}
          onClick={() => onChange(null)}
        >
          {t("Ganzer Tag")}
        </ChipButton>
        <ChipButton
          aria-pressed={some}
          on={some}
          look={look(some)}
          onClick={() => onChange(periods ?? [])}
        >
          {t("Nur einzelne Stunden")}
        </ChipButton>
      </div>
      {some && (
        <div className="mt-2.5 flex flex-wrap gap-1.75">
          {lessonNumbers(lessonTimes).map((n) => (
            <ChipButton
              key={n}
              aria-pressed={periods.includes(n)}
              aria-label={t("{n}. Stunde", { n })}
              on={periods.includes(n)}
              look={look(periods.includes(n), true)}
              onClick={() => toggle(n)}
            >
              {n}
            </ChipButton>
          ))}
        </div>
      )}
    </Field>
  );
};

export default FreePeriodsField;
