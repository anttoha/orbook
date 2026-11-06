import { cn } from "../../shared/utils/cn";

// Квадратик легенди і його підпис
const LegendItem = ({ className, label }) => (
  <span className="flex items-center gap-1.5">
    <span className={`size-2.5 ${className}`} />
    {label}
  </span>
);

// Один стовпчик: сірий низ — «fällt aus», фіолетовий верх — «Vertretung». Висота — частка від найвищого.
// showValue — число над стовпчиком (ПК); воно стоїть над стовпчиком, тому графік має відступ зверху
const Bar = ({ bar, showValue }) => (
  <div className="flex h-full flex-1 flex-col justify-end">
    <div className="relative flex flex-col justify-end gap-0.5" style={{ height: `${bar.cancelledPct + bar.substitutionsPct}%` }}>
      {showValue && <span className="absolute inset-x-0 bottom-full mb-1 text-center text-small font-extrabold text-ink">{bar.total}</span>}
      {bar.substitutions > 0 && <div className="min-h-0 flex-1 rounded-mark bg-accent" style={{ flexGrow: bar.substitutions }} />}
      {bar.cancelled > 0 && <div className="min-h-0 flex-1 rounded-mark bg-faint2" style={{ flexGrow: bar.cancelled }} />}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Графік «fällt aus / Vertretung»: «Diese Woche nach Tag» і (на ПК) «September nach Woche».
// bars — з stackedBars (shared/utils/stats.js); large — вищий графік з числами над стовпчиками (ПК)
// ─────────────────────────────────────────────────────────────
const StackedChart = ({ title, bars, large = false, className }) => {
  // для скрінрідера — те саме словами: «Mo: 1 fällt aus, 0 Vertretung»
  const summary = bars.map((b) => `${b.label}: ${b.cancelled} fällt aus, ${b.substitutions} Vertretung`).join("; ");

  return (
    <section className={cn("flex flex-col rounded-card bg-card px-3.5 pt-3.5 pb-4 lg:px-4.5 lg:pt-4.5", className)}>
      <h2 className="text-hint font-extrabold text-faint">{title}</h2>
      <div role="img" aria-label={summary} className={cn("flex gap-2.5", large ? "mt-auto h-40 pt-6 lg:gap-3" : "mt-7 h-14.5")}>
        {bars.map((bar) => (
          <Bar key={bar.label} bar={bar} showValue={large} />
        ))}
      </div>
      <div className={cn("mt-2 flex gap-2.5 text-small text-faint", large && "border-t border-hair pt-2 lg:gap-3")} aria-hidden="true">
        {bars.map((bar) => (
          <span key={bar.label} className="flex-1 text-center">
            {bar.label}
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

export default StackedChart;
