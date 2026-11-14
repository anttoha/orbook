import { useStats } from "../../shared/hooks/useStats";
import { useT } from "../../shared/hooks/useT";
import { cancelRateText } from "../../shared/utils/stats";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// ─────────────────────────────────────────────────────────────
// Блок «Statistik»: сколько уроков выпало на этой неделе (GET /api/stats?range=week, кеш как у страницы)
// ─────────────────────────────────────────────────────────────
const StatistikBlock = ({ editing }) => {
  const t = useT();
  const stats = useStats("week");
  const totals = stats.main?.totals;

  const body = () => {
    if (stats.status === "loading") return <BlockSkeleton />;
    if (!totals) return <BlockEmpty text="Gerade keine Zahlen" />;
    return (
      <>
        <p className="flex items-baseline gap-1.5">
          <span className="text-stat text-ink">{totals.cancelled ?? 0}</span>
          <span className="text-body-sm font-semibold text-muted">{t("ausgefallen")}</span>
        </p>
        <p className="mt-auto truncate text-caption text-faint">{`${cancelRateText(totals.cancelRate)} · ${t("diese Woche")}`}</p>
      </>
    );
  };

  return (
    <BlockCard kind="statistik" title={t("Statistik")} to="/statistik" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default StatistikBlock;
