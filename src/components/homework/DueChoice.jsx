import { Check } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { addDays, numericDate, subjectName, weekdayLong } from "../../shared/utils/format";
import { CalendarIcon } from "../ui/icons";
import TextField from "../ui/TextField";
import Liquid from "../ui/Liquid";
import { useT } from "../../shared/hooks/useT";

const row = "flex w-full items-center gap-3 rounded-field px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

// Вариант «Bis wann?»: выбранный — сиреневый с галочкой (макет 24 handy-06)
const Option = ({ title, note, selected, onClick, icon }) => (
  <button type="button" role="radio" aria-checked={selected} onClick={onClick} className={cn(row, selected && "bg-tint")}>
    <span className="min-w-0 flex-1">
      <span className={cn("block text-body", selected ? "font-extrabold text-accent-ink" : "text-ink")}>{title}</span>
      <span className="mt-0.5 block text-caption text-faint">{note}</span>
    </span>
    {selected ? <Check className="size-4.5 text-accent-ink" /> : icon}
  </button>
);

// ─────────────────────────────────────────────────────────────
// «Bis wann?» для домашки из урока (макет 24 handy-06): nächste / übernächste Stunde предмета или своя дата.
// options — из useNextLessons; value — { due, lesson }; lesson = null — «Anderes Datum» (до дня, без урока)
// ─────────────────────────────────────────────────────────────
const DueChoice = ({ subject, options, value, error, today, onChange }) => {
  const t = useT();
  const name = subjectName(subject);
  const custom = !options.some((slot) => slot.date === value.due && slot.period === value.lesson);
  const words = ["Nächste {name}-Stunde", "Übernächste {name}-Stunde"];

  return (
    <div>
      <p className="mb-2.25 text-hint font-extrabold text-faint">{t("Bis wann?")}</p>
      <Liquid as="div" refract press={false} role="radiogroup" aria-label={t("Bis wann?")} className="flex flex-col rounded-card bg-card p-1.5">
        {options.map((slot, k) => (
          <Option
            key={`${slot.date}-${slot.period}`}
            title={t(words[k], { name })}
            note={t("{1}, {2} · {period}. Stunde", { "1": weekdayLong(slot.date), "2": numericDate(slot.date), period: slot.period })}
            selected={!custom && value.due === slot.date && value.lesson === slot.period}
            onClick={() => onChange({ due: slot.date, lesson: slot.period })}
          />
        ))}
        <Option title={t("Anderes Datum")} note={t("im Kalender wählen")} selected={custom} icon={<CalendarIcon className="size-4.5 text-faint" />} onClick={() => onChange({ due: custom ? value.due : addDays(today, 1), lesson: null })} />
      </Liquid>
      {custom && <TextField id="homework-due" label={t("Abgabe bis")} type="date" className="mt-3" value={value.due} error={error} onChange={(event) => onChange({ due: event.target.value, lesson: null })} />}
      {!custom && error && (
        <p role="alert" className="mt-1.5 text-hint text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default DueChoice;
