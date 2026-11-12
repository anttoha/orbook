import { Trash2 } from "lucide-react";
import { useDayVersions } from "../../shared/hooks/useDayVersions";
import { useNow } from "../../shared/hooks/useNow";
import { useSheet } from "../../shared/hooks/useSheet";
import { useVisibleLesson } from "../../shared/hooks/useVisibleLesson";
import { dayHistory } from "../../shared/utils/dayHistory";
import { HistoryError, HistorySkeleton } from "./HistoryStates";
import VersionTimeline from "./VersionTimeline";

// ─────────────────────────────────────────────────────────────
// Лента «Verlauf des Tages» целиком: подпись, лента, срок хранения; загрузка и ошибка.
// Общая для шторки (телефон) и панели «Info zum Tag» (ПК). «Ansehen» → старая Fassung в шторке «verlauf».
// ─────────────────────────────────────────────────────────────
const DayHistory = ({ date, withIntro = true }) => {
  const { today } = useNow();
  const { openSheet } = useSheet();
  const visible = useVisibleLesson();
  const { state, data, reload } = useDayVersions(date);

  if (state === "loading") return <HistorySkeleton />;
  if (state === "error") return <HistoryError onRetry={reload} />;

  const entries = dayHistory(data?.versions, visible);
  if (!entries.length) return <p className="text-label text-muted">Für diesen Tag gibt es noch keinen Plan – also auch keinen Verlauf.</p>;

  return (
    <div className="flex flex-col gap-3">
      {withIntro && <p className="text-label text-muted">{entries.length === 1 ? "Seit der Veröffentlichung hat sich nichts geändert." : "Jede Änderung am Plan für diesen Tag – neueste oben."}</p>}
      <VersionTimeline entries={entries} today={today} onOpen={(id) => openSheet("verlauf", { datum: date, id }, { replace: false })} />
      <p className="flex items-center gap-1.5 text-caption text-faint">
        <Trash2 className="size-3.25" /> Fassungen bleiben {data?.keepDays ?? 30} Tage gespeichert.
      </p>
    </div>
  );
};

export default DayHistory;
