import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PeriodChart from "../components/stats/PeriodChart";
import StackedChart from "../components/stats/StackedChart";
import StatCard from "../components/stats/StatCard";
import StatsSkeleton from "../components/stats/StatsSkeleton";
import SubjectBars from "../components/stats/SubjectBars";
import { StatsIcon } from "../components/ui/icons";
import { PlanBanner, PlanError } from "../components/ui/PlanState";
import Segmented from "../components/ui/Segmented";
import StateScreen from "../components/ui/StateScreen";
import { DESKTOP_QUERY, useMediaQuery } from "../shared/hooks/useMediaQuery";
import { useStats } from "../shared/hooks/useStats";
import { byWeekTitle, cancelRateText, changedCount, compareWith, lessonsText, statsEyebrow, tooLittleText, untilText, weekBars, weekdayBars } from "../shared/utils/stats";

// «Halbjahr» є тільки на ПК (макет 20); на телефоні — два періоди, як у макеті 19
const RANGES = [
  { value: "week", label: "Woche" },
  { value: "month", label: "Monat" },
];
const RANGES_DESKTOP = [...RANGES, { value: "halfyear", label: "Halbjahr" }];

// Картки зверху: Ausfall, Vertretungen, Klausuren — і порівняння з минулим періодом.
// На ПК (long) ще четверта — «Ausfallquote», і підписи повні: «ggü. August», «bis 30. September»
const StatCards = ({ data, long }) => {
  const { totals, previous } = data;
  const cancelled = totals?.cancelled ?? 0;
  const changed = changedCount(totals);
  const cancelledDiff = compareWith(cancelled, previous?.totals?.cancelled ?? 0, data, { long });
  const changedDiff = compareWith(changed, changedCount(previous?.totals), data, { long });

  return (
    <div className="grid grid-cols-3 gap-2 lg:grid-cols-4 lg:gap-3">
      <StatCard value={cancelled} label={cancelled === 1 ? "Stunde fällt aus" : "Stunden fallen aus"} note={cancelledDiff?.text} tone={cancelledDiff?.tone} />
      <StatCard value={changed} label={changed === 1 ? "Vertretung" : "Vertretungen"} note={changedDiff?.text} tone={changedDiff?.tone} />
      <StatCard value={totals?.exams ?? 0} label={totals?.exams === 1 ? "Klausur" : "Klausuren"} note={untilText(data, { long })} />
      {long && <StatCard value={cancelRateText(totals?.cancelRate)} label="Ausfallquote" note={lessonsText(totals?.lessons)} />}
    </div>
  );
};

// Графіки. Телефон: лише «Diese Woche nach Tag».
// ПК: «<Monat> nach Woche» (широкий, 3/5) + «nach Tag» (2/5); у режимі «Woche» тиждень один — тоді тільки «nach Tag»
const Charts = ({ main, week, desktop }) => {
  const showWeeks = desktop && main.range !== "week" && main.byWeek?.length > 0;
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {showWeeks && <StackedChart title={byWeekTitle(main)} bars={weekBars(main.byWeek)} large className="lg:col-span-3" />}
      <StackedChart title="Diese Woche nach Tag" bars={weekdayBars(week?.byWeekday)} large={desktop} className={showWeeks ? "lg:col-span-2" : "lg:col-span-5"} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Сторінка Statistik. /statistik
// Дані: GET /api/stats (useStats), гайд docs/frontend/05-statistik.md.
// Період «Woche / Monat (/ Halbjahr на ПК)» не зберігається: щоразу відкривається «Monat», як у дизайні.
// ПК (макет 20): 4 картки, графіки 3/5 + 2/5, знизу три картки в ряд.
// ─────────────────────────────────────────────────────────────
const Statistic = () => {
  const [chosen, setRange] = useState("month");
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const range = !isDesktop && chosen === "halfyear" ? "month" : chosen; // вікно звузили — на телефоні Halbjahr немає
  const stats = useStats(range);
  const { main, week } = stats;

  const body = () => {
    if (stats.status === "loading") return <StatsSkeleton />;
    if (stats.status === "error") return <PlanError resource={stats} onRetry={stats.reload} title="Statistik konnte nicht geladen werden" />;
    // мало днів із даними — цифри ще нічого не кажуть (макет 37)
    if (!main.enoughData) return <StateScreen icon={StatsIcon} title="Noch zu wenig Daten" text={tooLittleText(main.trackingSince)} />;
    return (
      <>
        <StatCards data={main} long={isDesktop} />
        <Charts main={main} week={week} desktop={isDesktop} />
        <div className="mt-0.5 flex flex-col gap-6 lg:mt-0 lg:grid lg:grid-cols-3 lg:items-start lg:gap-3">
          <SubjectBars title="Fällt am häufigsten aus" items={main.topCancelledSubjects} valueKey="cancelled" />
          {isDesktop && <PeriodChart byPeriod={main.byPeriod} />}
          <SubjectBars title="Klausuren nach Fach" items={main.examsBySubject} valueKey="count" />
        </div>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-3">
        {/* Statistik відкривається з «Mehr» (частина 22): «назад» і «Mehr · September» над заголовком */}
        <div className="flex min-w-0 items-end gap-2.5">
          <Link to="/mehr" aria-label="Zurück" className="grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50 lg:mb-1">
            <ChevronLeft className="size-4.5" />
          </Link>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-hint font-extrabold text-faint">{["Mehr", statsEyebrow(null, main)].filter(Boolean).join(" · ")}</p>
            <h1 className="text-title text-ink lg:text-hero">Statistik</h1>
          </div>
        </div>
        <Segmented options={isDesktop ? RANGES_DESKTOP : RANGES} value={range} onChange={setRange} label="Zeitraum" size="form" className="shrink-0" />
      </header>

      <PlanBanner resource={stats} onRetry={stats.reload} />
      {body()}
    </section>
  );
};

export default Statistic;
