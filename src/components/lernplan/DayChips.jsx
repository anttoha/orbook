import { cn } from "../../shared/utils/cn";
import { MAX_DAYS } from "../../shared/utils/lernplan";
import ChipButton from "../ui/ChipButton";
import { useT } from "../../shared/hooks/useT";

// «Wie viele Tage lernen?» 1…7 (макет 41 handy-02). Дней больше, чем осталось до теста, — бледные и не нажимаются
const DayChips = ({ value, max, onChange }) => {
  const t = useT();
  return (
    <div className="grid grid-cols-7 gap-2" role="group" aria-label={t("Wie viele Tage lernen?")}>
      {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((n) => (
        <ChipButton
          key={n}
          aria-pressed={n === value}
          disabled={n > max}
          onClick={() => onChange(n)}
          on={n === value}
          look={cn(
            "grid h-11 place-items-center rounded-full border text-subhead outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
            n === value ? "border-accent bg-accent text-on-accent" : "border-rule bg-card text-ink",
            n > max && "cursor-default bg-transparent text-faint opacity-40",
          )}
        >
          {n}
        </ChipButton>
      ))}
    </div>
  );
};

export default DayChips;
