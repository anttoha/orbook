import { ChevronRight, History, RefreshCw } from "lucide-react";
import { useDayVersions } from "../../shared/hooks/useDayVersions";
import { useNow } from "../../shared/hooks/useNow";
import { useSheet } from "../../shared/hooks/useSheet";
import { useTicker } from "../../shared/hooks/useTicker";
import { usePlanStore } from "../../shared/store/planStore";
import { mondayOf, planMomentText } from "../../shared/utils/format";
import { agoText } from "../../shared/utils/liveText";
import LiveDot from "../live/LiveDot";

const rowClass = "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-paper";

// ─────────────────────────────────────────────────────────────
// Карточка в «Info zum Tag» на телефоне (часть 26, макет handy-01):
//   «Verlauf des Tages · 3 Fassungen · zuletzt geändert heute 07:12 ›» и «Zuletzt geprüft ● vor 20 Sek. ›».
// Вместо прежних трёх серых строк (Plan geändert / Veröffentlicht / Zuletzt geprüft).
// ─────────────────────────────────────────────────────────────
const DayHistoryCard = ({ day }) => {
  const { today } = useNow();
  const now = useTicker();
  const { openSheet } = useSheet();
  const live = usePlanStore((s) => s.live) === "live";
  const { state, data } = useDayVersions(day.date);
  const count = data?.versions?.length ?? 0;
  const checked = agoText(day.checkedAt ?? day.fetchedAt, now) ?? "noch nie";
  const changed = day.changedAt ? `zuletzt geändert ${planMomentText(day.changedAt, today)}` : "noch nicht geändert";
  const sub = state === "loading" ? "…" : state === "error" ? changed : `${count} ${count === 1 ? "Fassung" : "Fassungen"} · ${changed}`;

  return (
    <div className="divide-y divide-hair overflow-hidden rounded-card bg-card">
      {day.status === "ok" && (
        // replace — «Назад» из ленты закрывает её, а не возвращает «Info»
        <button type="button" onClick={() => openSheet("verlauf", { datum: day.date }, { replace: true })} className={rowClass}>
          <History className="size-4.75 shrink-0 text-accent-ink" />
          <span className="min-w-0 flex-1">
            <span className="block text-row text-ink">Verlauf des Tages</span>
            <span className="block truncate text-caption text-faint">{sub}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-faint2" />
        </button>
      )}
      <button type="button" onClick={() => openSheet("status", { datum: mondayOf(day.date) }, { replace: true })} className={rowClass}>
        <RefreshCw className="size-4.75 shrink-0 text-muted" />
        <span className={day.stale ? "flex-1 text-row text-danger" : "flex-1 text-row text-ink"}>Zuletzt geprüft</span>
        <LiveDot on={live && !day.stale} />
        <span className="text-label text-faint">{checked}</span>
        <ChevronRight className="size-4 shrink-0 text-faint2" />
      </button>
    </div>
  );
};

export default DayHistoryCard;
