import { Link } from "react-router-dom";
import { ArrowLeftRight, ChartNoAxesColumn, ChevronRight, RefreshCw } from "lucide-react";
import { countStatus } from "../../../shared/utils/lessons";
import Liquid from "../../ui/Liquid";
import { translate } from "../../../shared/i18n/translate";

// ─────────────────────────────────────────────────────────────
// Картка «2 Stunden fallen aus · Di, Mi / 2 Vertretungen · Mi, Do».
// Рахуємо самі з днів тижня. Клік по рядку — перший день, де це сталося.
// days — дні тижня (Mo–Fr) з сервера
// ─────────────────────────────────────────────────────────────
const WeekStatsCard = ({ days }) => {
  const cancelled = countStatus(days, ["cancelled"]); // fällt aus
  const changed = countStatus(days, ["substitution", "moved", "added"]); // усе, що малюється як Vertretung
  const rooms = countStatus(days, ["room_change"]); // Raumwechsel

  const rows = [
    { icon: ChartNoAxesColumn, text: cancelled.count === 1 ? translate("1 Stunde fällt aus") : translate("{count} Stunden fallen aus", { count: cancelled.count }), ...cancelled },
    { icon: RefreshCw, text: `${changed.count} ${changed.count === 1 ? translate("Vertretung") : translate("Vertretungen")}`, ...changed },
  ];
  // Raumwechsel показуємо, тільки якщо вони є (у макеті цього рядка немає)
  if (rooms.count) rows.push({ icon: ArrowLeftRight, text: translate("{count} Raumwechsel", { count: rooms.count }), ...rooms });

  return (
    <Liquid as="div" refract press={false} className="flex flex-col divide-y divide-hair rounded-box bg-card px-3.5">
      {rows.map((row) => {
        // Вміст рядка однаковий — посиланням або просто блоком
        const inner = (
          <>
            <row.icon className="size-4.75 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 text-body font-semibold text-ink">{row.text}</span>
            <span className="text-caption font-semibold text-faint">{row.days.map((d) => translate(d)).join(", ")}</span>
            <ChevronRight className="size-4 shrink-0 text-faint" />
          </>
        );
        return row.first ? (
          <Link key={row.text} to={`/tag/${row.first}`} className="flex items-center gap-3 py-3.5">
            {inner}
          </Link>
        ) : (
          <div key={row.text} className="flex items-center gap-3 py-3.5 opacity-60">
            {inner}
          </div>
        );
      })}
    </Liquid>
  );
};

export default WeekStatsCard;
