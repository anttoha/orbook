import { RefreshCw, TriangleAlert } from "lucide-react";
import { Skeleton } from "../ui/PlanState";
import PillButton from "../ui/PillButton";
import Liquid from "../ui/Liquid";

// Лента ещё грузится (макет handy-05): три строки-заглушки
export const HistorySkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-3">
    <Skeleton className="h-3 w-60" />
    <Liquid as="div" refract press={false} className="flex flex-col divide-y divide-hair rounded-card bg-card px-3.5">
      {["w-24", "w-28", "w-32"].map((width, i) => (
        <div key={width} className="flex gap-3.5 py-4">
          <Skeleton className="mt-0.5 size-3 rounded-full" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className={`h-3.5 ${width}`} />
            <Skeleton className={i === 2 ? "h-2.5 w-36" : "h-2.5 w-52"} />
          </div>
        </div>
      ))}
    </Liquid>
  </div>
);

// Лента не пришла (макет handy-06): план дня на месте, ленты без сети нет
export const HistoryError = ({ onRetry }) => (
  <div className="flex flex-col gap-3">
    <p className="flex items-start gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted">
      <TriangleAlert className="mt-px size-4 shrink-0" />
      <span>
        Der Verlauf kommt gerade nicht an.
        <br />
        Der Plan selbst ist gespeichert und stimmt.
      </span>
    </p>
    <PillButton glass="glass" size="lg" onClick={onRetry} className="flex h-12 items-center justify-center gap-2 rounded-full bg-sand text-row font-bold text-ink active:opacity-80">
      <RefreshCw className="size-4" /> Nochmal versuchen
    </PillButton>
    <p className="text-center text-caption text-faint">Den Verlauf gibt es nur mit Internet.</p>
  </div>
);
