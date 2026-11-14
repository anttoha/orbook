import { ChevronLeft, ChevronRight, Info, List, Share } from "lucide-react";
import { usePlanStore } from "../../../shared/store/planStore";
import { longDate, nextSchoolDay, relativeDayWord, weekdayLong } from "../../../shared/utils/format";
import ChangedLine from "../../week/ChangedLine";
import { TimelineIcon } from "../../ui/icons";
import Segmented from "../../ui/Segmented";
import { AllCoursesButton } from "../../week/AllCourses";
import RoundButton from "../../ui/RoundButton";


// Варіанти вигляду дня
const VIEWS = [
  { value: "liste", label: "Liste", icon: List },
  { value: "zeitleiste", label: "Zeitleiste", icon: TimelineIcon },
];

// ─────────────────────────────────────────────────────────────
// Шапка сторінки дня на ПК (макет «Tag · Liste»):
//   Mittwoch · heute                     [Liste|Zeitleiste]  ‹ ›  ⇪
//   7. Oktober
// onShare — null, якщо «Teilen» вимкнене адміном (тоді кнопки немає)
// day — день (ще може бути null, поки вантажиться); onInfo — відкрити «Info zum Tag» (решение власника)
// ─────────────────────────────────────────────────────────────
const DayHeaderDesktop = ({ date, today, day, view, onViewChange, onInfo, onShare }) => {
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
        <ChangedLine day={day} isToday={false} className="mt-0.5 h-3.5 text-caption leading-none" iconClassName="size-2.5" />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <AllCoursesButton variant="pill" />
          <Segmented label="Ansicht" options={VIEWS} value={view} onChange={onViewChange} variant="accent" size="sm" className="shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <RoundButton to={`/tag/${nextSchoolDay(date, holidays, -1)}`} aria-label="Vortag">
            <ChevronLeft className="size-4.25" />
          </RoundButton>
          <RoundButton to={`/tag/${nextSchoolDay(date, holidays, 1)}`} aria-label="Nächster Tag">
            <ChevronRight className="size-4.25" />
          </RoundButton>
          {day && (
            <RoundButton aria-label="Info zum Tag" onClick={onInfo}>
              <Info className="size-4.25" />
            </RoundButton>
          )}
          {onShare && (
            <RoundButton aria-label="Tag teilen" onClick={onShare}>
              <Share className="size-4.25" />
            </RoundButton>
          )}
        </div>
      </div>
    </header>
  );
};

export default DayHeaderDesktop;
