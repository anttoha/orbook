import { weekdayBars } from "../../shared/utils/stats";

// Квадратик легенди і його підпис
const LegendItem = ({ className, label }) => (
  <span className="flex items-center gap-1.5">
    <span className={`size-2.5 ${className}`} />
    {label}
  </span>
);

// Один день: сірий низ — «fällt aus», фіолетовий верх — «Vertretung». Висота — частка від найвищого дня
const DayBar = ({ bar }) => (
  <div className="flex h-full flex-1 flex-col justify-end gap-0.5">
    {bar.substitutions > 0 && <div className="rounded-mark bg-accent" style={{ height: `${bar.substitutionsPct}%` }} />}
    {bar.cancelled > 0 && <div className="rounded-mark bg-faint2" style={{ height: `${bar.cancelledPct}%` }} />}
  </div>
);

// Блок «Diese Woche nach Tag»: стовпчики Mo–Fr (byWeekday з запиту range=week)
const WeekdayChart = ({ byWeekday }) => {
  const bars = weekdayBars(byWeekday);
  // для скрінрідера — те саме словами: «Mo: 1 fällt aus, 0 Vertretungen»
  const summary = bars.map((b) => `${b.weekday}: ${b.cancelled} fällt aus, ${b.substitutions} Vertretung`).join("; ");

  return (
    <section className="rounded-card bg-card px-3.5 pt-3.5 pb-4">
      <h2 className="text-hint font-extrabold text-faint">Diese Woche nach Tag</h2>
      <div role="img" aria-label={summary} className="mt-7 flex h-14.5 gap-2.5">
        {bars.map((bar) => (
          <DayBar key={bar.weekday} bar={bar} />
        ))}
      </div>
      <div className="mt-2 flex gap-2.5 text-small text-faint" aria-hidden="true">
        {bars.map((bar) => (
          <span key={bar.weekday} className="flex-1 text-center">
            {bar.weekday}
          </span>
        ))}
      </div>
      <div className="mt-3.5 flex gap-4 text-note text-muted">
        <LegendItem className="bg-faint2" label="fällt aus" />
        <LegendItem className="bg-accent" label="Vertretung" />
      </div>
    </section>
  );
};

export default WeekdayChart;
