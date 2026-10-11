import { CloudOff, RefreshCw, TriangleAlert } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { standText } from "../../shared/utils/format";
import { berlinParts } from "../../shared/utils/lessonClock";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Стани завантаження (гайд docs/frontend/08-zustaende.md):
//   <Skeleton />            — сірі «заглушки», поки дані йдуть (стан "loading")
//   <PlanBanner resource /> — плашка над екраном, коли показано збережене:
//                             "offline"     → «Offline · Stand von heute 07:12» + «Neu laden»
//                             "unavailable" → «Plan kommt gerade nicht an …» + «Erneut versuchen»
//   <PlanError resource />  — даних немає зовсім (стан "error"): текст помилки + «Erneut versuchen»
// resource — те, що повертає useWeek: { status, savedAt, error }
// onRetry  — що робити по кнопці (наприклад, завантажити тиждень ще раз)
// ─────────────────────────────────────────────────────────────

// Сірий прямокутник-заглушка. className задає розмір і форму
export const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-2xl bg-skeleton", className)} />;

// Маленька кнопка в плашці
const RetryButton = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-label font-extrabold text-ink">
    <RefreshCw className="size-3.5" /> {children}
  </button>
);

// Плашка «показано збережене»
export const PlanBanner = ({ resource, onRetry, className }) => {
  const { today } = useNow();
  if (resource.status !== "offline" && resource.status !== "unavailable") return null; // усе гаразд
  // savedAt — час збереження в UTC ("…Z"); переводимо в берлінський, щоб «07:12» був місцевим
  const saved = resource.savedAt ? berlinParts(new Date(resource.savedAt)) : null;
  const stand = saved ? standText(`${saved.date}T${saved.hhmm}`, today) : "letzter Stand"; // «Stand von heute 07:12»

  if (resource.status === "offline") {
    return (
      <div role="status" className={cn("flex items-center gap-3 rounded-2xl bg-sand px-3.5 py-2.5 text-label font-bold text-ink", className)}>
        <CloudOff className="size-4.5 shrink-0 text-muted" />
        <span className="min-w-0 flex-1">Offline · {stand}</span>
        <RetryButton onClick={onRetry}>Neu laden</RetryButton>
      </div>
    );
  }

  return (
    <div role="status" className={cn("flex flex-col gap-2 rounded-2xl bg-danger-tint px-3.5 py-3 text-label font-bold text-ink", className)}>
      <p className="flex items-center gap-2 font-black text-danger">
        <TriangleAlert className="size-4.5 shrink-0" /> Plan kommt gerade nicht an
      </p>
      <p className="font-semibold text-muted">stundenplan24.de antwortet nicht. Meist liegt das am Schulserver, nicht an dir. Gezeigt: {stand}.</p>
      <div>
        <RetryButton onClick={onRetry}>Erneut versuchen</RetryButton>
      </div>
    </div>
  );
};

// Даних немає зовсім
export const PlanError = ({ resource, onRetry }) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-[22px] bg-card px-5 py-10 text-center">
    <TriangleAlert className="size-7 text-danger" />
    <p className="text-subhead text-ink">Plan konnte nicht geladen werden</p>
    {/* текст помилки від сервера (німецькою) або від api.js («Keine Verbindung…») */}
    <p className="text-label font-semibold text-muted">{resource.error?.message}</p>
    <RetryButton onClick={onRetry}>Erneut versuchen</RetryButton>
  </div>
);
