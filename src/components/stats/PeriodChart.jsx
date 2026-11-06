import { cn } from "../../shared/utils/cn";
import { periodBars } from "../../shared/utils/stats";

// ─────────────────────────────────────────────────────────────
// «Ausfall nach Stunde» (ПК, макет 20): фіолетові стовпчики 1.–8. урок, число відмін над кожним.
// byPeriod — з GET /api/stats; порожній — блок не показуємо
// ─────────────────────────────────────────────────────────────
const PeriodChart = ({ byPeriod, className }) => {
  // className — місце в сітці сторінки
  const bars = periodBars(byPeriod);
  if (bars.length === 0) return null;
  const summary = bars.map((b) => `${b.label} Stunde: ${b.value} fällt aus`).join("; ");

  return (
    <section className={cn("flex flex-col rounded-card bg-card px-4.5 pt-4.5 pb-4", className)}>
      <h2 className="text-hint font-extrabold text-faint">Ausfall nach Stunde</h2>
      <div role="img" aria-label={summary} className="mt-auto flex h-32 gap-2 pt-6">
        {bars.map((bar) => (
          <div key={bar.label} className="flex h-full flex-1 flex-col justify-end">
            <div className="relative rounded-mark bg-accent" style={{ height: `${bar.pct}%` }}>
              <span className="absolute inset-x-0 bottom-full mb-1 text-center text-small font-extrabold text-ink">{bar.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 border-t border-hair pt-2 text-small text-faint" aria-hidden="true">
        {bars.map((bar) => (
          <span key={bar.label} className="flex-1 text-center">
            {bar.label}
          </span>
        ))}
      </div>
    </section>
  );
};

export default PeriodChart;
