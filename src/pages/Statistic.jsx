import { useState } from "react";
import StatCard from "../components/stats/StatCard";
import StatsSkeleton from "../components/stats/StatsSkeleton";
import SubjectBars from "../components/stats/SubjectBars";
import WeekdayChart from "../components/stats/WeekdayChart";
import { StatsIcon } from "../components/ui/icons";
import { PlanBanner, PlanError } from "../components/ui/PlanState";
import Segmented from "../components/ui/Segmented";
import StateScreen from "../components/ui/StateScreen";
import { useStats } from "../shared/hooks/useStats";
import { usePlanStore } from "../shared/store/planStore";
import { changedCount, compareWith, statsEyebrow, tooLittleText, untilText } from "../shared/utils/stats";

const RANGES = [
  { value: "week", label: "Woche" },
  { value: "month", label: "Monat" },
];

// Три картки зверху: Ausfall, Vertretungen, Klausuren — і порівняння з минулим періодом
const StatCards = ({ data }) => {
  const { totals, previous } = data;
  const cancelled = totals?.cancelled ?? 0;
  const changed = changedCount(totals);
  const cancelledDiff = compareWith(cancelled, previous?.totals?.cancelled ?? 0, data);
  const changedDiff = compareWith(changed, changedCount(previous?.totals), data);

  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard value={cancelled} label={cancelled === 1 ? "Stunde fällt aus" : "Stunden fallen aus"} note={cancelledDiff?.text} tone={cancelledDiff?.tone} />
      <StatCard value={changed} label={changed === 1 ? "Vertretung" : "Vertretungen"} note={changedDiff?.text} tone={changedDiff?.tone} />
      <StatCard value={totals?.exams ?? 0} label={totals?.exams === 1 ? "Klausur" : "Klausuren"} note={untilText(data)} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Сторінка Statistik. /statistik
// Дані: GET /api/stats (useStats), гайд docs/frontend/05-statistik.md.
// Період «Woche / Monat» не зберігається: щоразу відкривається «Monat», як у дизайні.
// ─────────────────────────────────────────────────────────────
const Statistic = () => {
  const [range, setRange] = useState("month");
  const stats = useStats(range);
  const className = usePlanStore((s) => s.me?.className);
  const { main, week } = stats;

  const body = () => {
    if (stats.status === "loading") return <StatsSkeleton />;
    if (stats.status === "error") return <PlanError resource={stats} onRetry={stats.reload} title="Statistik konnte nicht geladen werden" />;
    // мало днів із даними — цифри ще нічого не кажуть (макет 37)
    if (!main.enoughData) return <StateScreen icon={StatsIcon} title="Noch zu wenig Daten" text={tooLittleText(main.trackingSince)} />;
    return (
      <>
        <StatCards data={main} />
        <WeekdayChart byWeekday={week?.byWeekday} />
        <div className="mt-3 flex flex-col gap-8">
          <SubjectBars title="Fällt am häufigsten aus" items={main.topCancelledSubjects} valueKey="cancelled" />
          <SubjectBars title="Klausuren nach Fach" items={main.examsBySubject} valueKey="count" />
        </div>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-5 lg:max-w-186">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-hint font-extrabold text-faint">{statsEyebrow(className, main) || " "}</p>
          <h1 className="text-title text-ink lg:text-hero">Statistik</h1>
        </div>
        <Segmented options={RANGES} value={range} onChange={setRange} label="Zeitraum" size="form" className="shrink-0" />
      </header>

      <PlanBanner resource={stats} onRetry={stats.reload} />
      {body()}
    </section>
  );
};

export default Statistic;
