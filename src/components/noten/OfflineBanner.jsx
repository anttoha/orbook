import { CircleAlert } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { dotDate } from "../../shared/utils/noten";
import { translate } from "../../shared/i18n/translate";

// Розовая плашка «InfoPoint nicht erreichbar» (макет handy-07): оценки — из кеша, «Nochmal» — ещё раз
const OfflineBanner = ({ data, busy, onRetry }) => {
  const t = useT();
  const since = data?.updatedAt ?? data?.fetchedAt?.slice(0, 10);
  return (
    <div className="flex items-center gap-3 rounded-block bg-danger-tint px-3.5 py-3">
      <CircleAlert className="size-5.5 shrink-0 text-danger" />
      <span className="min-w-0 flex-1">
        <span className="block text-row font-extrabold text-ink">{t("InfoPoint nicht erreichbar")}</span>
        {since && <span className="block text-caption text-muted">{translate("Stand vom {date}", { date: dotDate(since) })}</span>}
      </span>
      <button type="button" onClick={onRetry} disabled={busy} className="h-8.5 shrink-0 rounded-full bg-sand px-4 text-label font-extrabold text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40">
        {t("Nochmal")}
      </button>
    </div>
  );
};

export default OfflineBanner;
