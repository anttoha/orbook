import { ChevronLeft, ChevronRight, Clock, List } from "lucide-react";
import { addDays } from "../../../shared/utils/format";
import Segmented from "../../ui/Segmented";
import WeekMenu from "../WeekMenu";
import WeekPickerPopover from "./WeekPickerPopover";

// Кругла біла кнопка 38×38 (як на макеті)
const roundButton =
  "grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink transition-colors outline-none hover:bg-sand focus-visible:ring-2 focus-visible:ring-accent/50";

// Варіанти вигляду тижня
const VIEWS = [
  { value: "zeitraster", label: "Zeitraster", icon: Clock },
  { value: "stunden", label: "Stunden + Tag", icon: List },
];

// ─────────────────────────────────────────────────────────────
// Шапка тижня на ПК:
//   KW 41 · 5.–9. Okt                 ‹ [Heute] › 📅   [Zeitraster|Stunden + Tag]  ⋮
//   Diese Woche
// monday — понеділок показаного тижня; onWeekChange(понеділок) — інший тиждень
// ─────────────────────────────────────────────────────────────
const WeekHeaderDesktop = ({ monday, subtitle, title, view, onViewChange, onWeekChange, onToday }) => {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="text-label font-extrabold text-faint">{subtitle}</p>
        <h1 className="text-hero text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* навігація по тижнях */}
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Vorige Woche" onClick={() => onWeekChange(addDays(monday, -7))} className={roundButton}>
            <ChevronLeft className="size-4.25" />
          </button>
          <button type="button" onClick={onToday} className="h-10 rounded-full bg-sand px-4.5 text-body font-bold text-ink transition-colors hover:bg-hair">
            Heute
          </button>
          <button type="button" aria-label="Nächste Woche" onClick={() => onWeekChange(addDays(monday, 7))} className={roundButton}>
            <ChevronRight className="size-4.25" />
          </button>
          <WeekPickerPopover monday={monday} onPick={onWeekChange} buttonClassName={roundButton} />
        </div>

        {/* вигляд тижня + меню */}
        <div className="flex items-center gap-2">
          <Segmented label="Ansicht" options={VIEWS} value={view} onChange={onViewChange} variant="accent" size="sm" className="shrink-0" />
          <WeekMenu monday={monday} onToday={onToday} />
        </div>
      </div>
    </header>
  );
};

export default WeekHeaderDesktop;
