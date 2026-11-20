import { useT } from "../../shared/hooks/useT";
import { useNotenStore } from "../../shared/store/notenStore";
import { dayDate, defaultHalf, latestGrade, noteNumber, overviewOf } from "../../shared/utils/noten";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";

// ─────────────────────────────────────────────────────────────
// Блок «Noten» (макет 36 handy-10): Schnitt полугодия и новая (или последняя) оценка.
// Данные — кеш notenStore, без запроса к InfoPoint
// ─────────────────────────────────────────────────────────────
const NotenBlock = ({ editing }) => {
  const t = useT();
  const data = useNotenStore((s) => s.data);
  const fresh = useNotenStore((s) => s.fresh);

  const body = () => {
    if (!data) return <BlockEmpty text={t("Noch keine Noten")} />;
    const average = overviewOf(data, defaultHalf(data)).average;
    const last = latestGrade(data, fresh);
    return (
      <>
        <p className="flex items-baseline gap-1.5">
          <span className="text-stat text-ink">{noteNumber(average)}</span>
          <span className="text-body-sm font-semibold text-muted">{t("Schnitt")}</span>
        </p>
        {last && (
          <div className="mt-auto min-w-0">
            <p className="truncate text-body-sm font-extrabold text-ink">
              <span className="text-accent-ink">{last.fresh ? t("Neu:") : t("Zuletzt:")}</span> {last.subject.name} {last.grade.grade}
            </p>
            <p className="truncate text-caption text-faint">{dayDate(last.grade.date)}</p>
          </div>
        )}
      </>
    );
  };

  return (
    <BlockCard kind="noten" title={t("Noten")} to="/noten" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default NotenBlock;
