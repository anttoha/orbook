import { Link } from "react-router-dom";
import { ChartNoAxesGantt, ChevronLeft, ChevronRight, List, Share } from "lucide-react";
import { usePlanStore } from "../../../shared/store/planStore";
import { longDate, nextSchoolDay, relativeDayWord, weekdayLong } from "../../../shared/utils/format";
import Segmented from "../../ui/Segmented";

// Кругла біла кнопка 38×38 (як на макеті)
const roundButton =
  "grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink transition-colors outline-none hover:bg-sand focus-visible:ring-2 focus-visible:ring-accent/50";

// Варіанти вигляду дня
const VIEWS = [
  { value: "liste", label: "Liste", icon: List },
  { value: "zeitleiste", label: "Zeitleiste", icon: ChartNoAxesGantt },
];

// ─────────────────────────────────────────────────────────────
// Шапка сторінки дня на ПК (макет «Tag · Liste»):
//   Mittwoch · heute                     [Liste|Zeitleiste]  ‹ ›  ⇪
//   7. Oktober
// search — хвіст адреси (?ansicht=zeitleiste), щоб при гортанні днів вигляд зберігався
// onShare — null, якщо «Teilen» вимкнене адміном (тоді кнопки немає)
// ─────────────────────────────────────────────────────────────
const DayHeaderDesktop = ({ date, today, view, onViewChange, onShare, search }) => {
  const holidays = usePlanStore((s) => s.meta?.holidays); // вільні дні пропускаємо
  const word = relativeDayWord(date, today); // heute / morgen / gestern

  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="text-label font-extrabold text-accent">
          {weekdayLong(date)}
          {word && ` · ${word}`}
        </p>
        <h1 className="text-hero text-ink">{longDate(date)}</h1>
      </div>

      <div className="flex items-center gap-6">
        <Segmented label="Ansicht" options={VIEWS} value={view} onChange={onViewChange} variant="accent" size="sm" className="shrink-0" />
        <div className="flex items-center gap-2">
          <Link to={`/tag/${nextSchoolDay(date, holidays, -1)}${search}`} aria-label="Vortag" className={roundButton}>
            <ChevronLeft className="size-4.25" />
          </Link>
          <Link to={`/tag/${nextSchoolDay(date, holidays, 1)}${search}`} aria-label="Nächster Tag" className={roundButton}>
            <ChevronRight className="size-4.25" />
          </Link>
          {onShare && (
            <button type="button" aria-label="Tag teilen" onClick={onShare} className={roundButton}>
              <Share className="size-4.25" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default DayHeaderDesktop;
