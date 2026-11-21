import { CalendarSync } from "lucide-react";
import { fetchedLabel } from "../../shared/utils/calendarFeed";
import { useT } from "../../shared/hooks/useT";

// Зелёная карточка «Abo aktiv» + когда календарь последний раз забирал ленту (макет handy-02).
// lastFetchedAt null → «Noch nicht abgerufen»: подключили недавно или календарь ещё не заходил
const FeedStatus = ({ lastFetchedAt }) => {
  const t = useT();
  return (
    <div className="flex items-center gap-3 rounded-card bg-ok-tint px-3.5 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card">
        <CalendarSync className="size-4.5 text-ok" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-row font-extrabold text-ok">{t("Abo aktiv")}</p>
        <p className="truncate text-caption text-muted">{fetchedLabel(lastFetchedAt)}</p>
      </div>
    </div>
  );
};

export default FeedStatus;
