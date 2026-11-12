import { useHistory } from "../../shared/hooks/useHomework";
import { cn } from "../../shared/utils/cn";
import { changeActor, changeText, changeTime } from "../../shared/utils/homework";
import { Skeleton } from "../ui/PlanState";

// ─────────────────────────────────────────────────────────────
// «Verlauf» (макет handy-15): хто і що змінив, нові зверху. Без імен учнів.
// Показуємо, лише коли запис уже змінювали (entry.lastChange): інакше там один рядок «Eingetragen».
// kind — "homework" | "exams", noun — «Hausaufgabe» / «Klausur» для підпису внизу
// ─────────────────────────────────────────────────────────────
const HistoryList = ({ kind, entry, noun }) => {
  const history = useHistory(kind, entry.id, entry.version, Boolean(entry.lastChange));
  if (history.status === "off") return null;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-hint font-extrabold text-faint">Verlauf</h3>
      {history.status === "loading" && <Skeleton className="h-16 rounded-card" />}
      {history.status === "error" && <p className="text-label text-muted">{history.error?.message}</p>}
      {history.status === "ready" && (
        <ol className="rounded-card bg-card px-4">
          {history.changes.map((change, index) => (
            <li key={`${change.at}-${index}`} className="flex gap-2.5 border-b border-rule py-2.75 last:border-0">
              <span className={cn("mt-1.5 size-1.75 shrink-0 rounded-full", index === 0 ? "bg-accent" : "bg-faint2")} />
              <span className="min-w-0">
                <span className="block text-label font-extrabold text-ink">
                  {changeTime(change.at)} · <span className={cn(change.by === "student" && "text-accent-ink")}>{changeActor(change)}</span>
                </span>
                <span className="mt-0.5 block text-caption text-muted">{changeText(change)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="text-caption text-faint">Der Verlauf wird mit {noun === "Test" ? "dem Test" : `der ${noun}`} gelöscht.</p>
    </section>
  );
};

export default HistoryList;
