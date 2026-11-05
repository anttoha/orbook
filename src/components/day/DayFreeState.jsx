import { Link } from "react-router-dom";
import { ChevronRight, Clock, RotateCw, Sun } from "lucide-react";
import { usePlanStore } from "../../shared/store/planStore";
import { nextSchoolDay, shortDate, weekdayLong, weekdayShort } from "../../shared/utils/format";
import Button from "../ui/Button";
import { PlanDown } from "../ui/PlanState";
import StateScreen from "../ui/StateScreen";

// Заголовок вільного дня. Назви свята в даних немає, тому пишемо загальне «Schulfrei».
const freeTitle = (day, isToday) => {
  if (day.freeReason === "weekend") return "Wochenende";
  return isToday ? "Heute ist frei" : "Schulfrei";
};

// ─────────────────────────────────────────────────────────────
// День без плану: вихідний, свято, план ще не вийшов, школа не відповідає.
// Макети «Tag · frei», «Tag · Plan fehlt noch», «Plan nicht erreichbar».
// fill — зайняти висоту екрана (false, коли нижче є сірі уроки «vorläufig»)
// ─────────────────────────────────────────────────────────────
const DayFreeState = ({ day, today, week, onRetry, fill }) => {
  const holidays = usePlanStore((s) => s.meta?.holidays);
  const refreshPlan = usePlanStore((s) => s.refreshPlan);
  const refreshing = usePlanStore((s) => s.refreshing);

  if (day.status === "holiday") {
    const next = nextSchoolDay(day.date, holidays);
    return (
      <StateScreen icon={Sun} title={freeTitle(day, day.date === today)} text="Laut Plan kein Unterricht." fill={fill}>
        {next && (
          <Link to={`/tag/${next}`} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sand text-row font-bold text-ink">
            <ChevronRight className="size-4" /> Nächster Schultag · {weekdayShort(next)}, {shortDate(next)}
          </Link>
        )}
      </StateScreen>
    );
  }

  if (day.status === "not_published") {
    return (
      <StateScreen
        icon={Clock}
        title={`Plan für ${weekdayLong(day.date)} fehlt noch`}
        // «regelmäßig», а не «alle 5 Minuten»: на канікулах і у вихідні сервер дивиться раз на годину
        text="Die Schule stellt den Plan meist am Vortag ab Mittag online. ORBook schaut regelmäßig nach."
        fill={fill}
      >
        <Button variant="primary" onClick={refreshPlan} disabled={refreshing} className="flex-none">
          <RotateCw className="size-4" /> Jetzt prüfen
        </Button>
      </StateScreen>
    );
  }

  return <PlanDown resource={week} onRetry={onRetry} fill={fill} />;
};

export default DayFreeState;
