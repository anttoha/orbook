import { RotateCw, TriangleAlert, WifiOff } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { lastStandLabel, standText } from "../../shared/utils/format";
import { berlinParts } from "../../shared/utils/lessonClock";
import Button from "./Button";
import StateScreen from "./StateScreen";
import PillButton from "./PillButton";

// ─────────────────────────────────────────────────────────────
// Стани завантаження (гайд docs/frontend/08-zustaende.md):
//   <Skeleton />            — сірі «заглушки», поки дані йдуть (стан "loading")
//   <PlanBanner resource /> — плашка над екраном, коли показано збережене
//   <PlanDown resource />   — школа або сервер не відповідає: екран «Plan kommt gerade nicht an»
//   <PlanError resource />  — даних немає зовсім (стан "error"): текст помилки + «Erneut versuchen»
// resource — те, що повертає useWeek: { status, savedAt, error }
// onRetry  — що робити по кнопці (наприклад, завантажити тиждень ще раз)
// ─────────────────────────────────────────────────────────────

// Сірий прямокутник-заглушка. className задає розмір і форму
export const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-field bg-skeleton", className)} />;

// savedAt — час збереження в UTC ("…Z"); переводимо в берлінський, щоб «07:12» був місцевим
const savedMoment = (savedAt) => {
  if (!savedAt) return null;
  const { date, hhmm } = berlinParts(new Date(savedAt));
  return `${date}T${hhmm}`;
};

// Плашка «показано збережене». Без мережі: «Offline · Stand von heute 07:12».
// Школа не відповідає, а учень сам попросив останній стан: «Nicht erreichbar · Stand von …»
export const PlanBanner = ({ resource, onRetry, className }) => {
  const { today } = useNow();
  if (resource.status !== "offline" && resource.status !== "unavailable") return null; // усе гаразд
  const isOffline = resource.status === "offline";
  const stand = standText(savedMoment(resource.savedAt), today);
  const Icon = isOffline ? WifiOff : TriangleAlert;

  return (
    <div role="status" className={cn("flex items-center gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted", className)}>
      <Icon className="size-4 shrink-0" />
      <p className="min-w-0 flex-1">
        <span className="font-bold text-ink">{isOffline ? "Offline" : "Nicht erreichbar"}{stand && " ·"}</span> {stand}
      </p>
      <button type="button" onClick={onRetry} className="shrink-0 font-bold text-accent-ink">
        {isOffline ? "Neu laden" : "Erneut versuchen"}
      </button>
    </div>
  );
};

// Школа або сервер не відповідає. Якщо є збережене, його можна показати окремою кнопкою
export const PlanDown = ({ resource, onRetry, fill }) => {
  const { today } = useNow();
  const showLastStand = usePlanStore((s) => s.showLastStand);

  return (
    <StateScreen icon={TriangleAlert} title="Plan kommt gerade nicht an" text="stundenplan24.de antwortet nicht. Meist liegt das am Schulserver, nicht an dir." fill={fill}>
      <Button variant="primary" onClick={onRetry} className="flex-none">
        <RotateCw className="size-4" /> Erneut versuchen
      </Button>
      {resource.status === "unavailable" && (
        <Button onClick={showLastStand} className="flex-none">
          Letzten Stand zeigen · {lastStandLabel(savedMoment(resource.savedAt), today)}
        </Button>
      )}
    </StateScreen>
  );
};

// Даних немає зовсім
export const PlanError = ({ resource, onRetry, title = "Plan konnte nicht geladen werden" }) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-card bg-card px-5 py-10 text-center">
    <TriangleAlert className="size-7 text-danger" />
    <p className="text-subhead text-ink">{title}</p>
    {/* текст помилки від сервера (німецькою) або від api.js («Keine Verbindung…») */}
    <p className="text-label font-semibold text-muted">{resource.error?.message}</p>
    {/* плашка стоїть на картці, тому кнопці потрібен інший фон, інакше її не видно */}
    <PillButton glass="glass" size="sm" onClick={onRetry} className="flex shrink-0 items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-label font-extrabold text-ink">
      <RotateCw className="size-3.5" /> Erneut versuchen
    </PillButton>
  </div>
);
