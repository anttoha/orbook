import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { dayDate } from "../../shared/utils/noten";
import DateTile from "./DateTile";

// Плитка с числом: «2 Fehltage»; danger — число красным (unentschuldigt)
export const AbsenceTile = ({ value, label, danger }) => (
  <div className="flex min-w-0 flex-col rounded-card bg-card px-3 pt-3.5 pb-3.5">
    <span className={cn("text-stat", danger && value > 0 ? "text-danger" : "text-ink")}>{value}</span>
    <span className="mt-1 truncate text-caption font-bold text-muted">{label}</span>
  </div>
);

// Плашка «entschuldigt» / «unentschuldigt»; excused null — школа не указала, плашки нет
const Excused = ({ excused }) => {
  const t = useT();
  if (excused == null) return null;
  return (
    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-label font-extrabold", excused ? "bg-ok-tint text-ok" : "bg-danger-tint text-danger")}>
      {excused ? t("entschuldigt") : t("unentschuldigt")}
    </span>
  );
};

// «Einträge»: дни и часы пропусков, новые сверху (макет handy-09)
const AbsenceList = ({ entries }) => {
  const t = useT();
  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Einträge")}</h2>
      {entries.length === 0 ? (
        <p className="rounded-card bg-card px-4 py-4 text-body-sm text-muted">{t("Keine Fehlzeiten")}</p>
      ) : (
        <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
          {entries.map((e) => (
            <li key={e.key} className="flex items-center gap-3 py-3">
              <DateTile iso={e.date} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-row font-extrabold text-ink">{e.title}</span>
                <span className="block truncate text-caption text-faint">{[dayDate(e.date), e.sub].filter(Boolean).join(" · ")}</span>
              </span>
              <Excused excused={e.excused} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AbsenceList;
