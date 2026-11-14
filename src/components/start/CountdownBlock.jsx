import { useAppointments } from "../../shared/hooks/useAppointments";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { holidayCountdown } from "../../shared/utils/startData";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// ─────────────────────────────────────────────────────────────
// Блок «Countdown» (макет pc-01): учебных дней до ближайших каникул — из Termine вида «Frei».
// Полоска — сколько прошло от прошлых каникул (если они ещё в списке)
// ─────────────────────────────────────────────────────────────
const CountdownBlock = ({ editing }) => {
  const t = useT();
  const { today } = useNow();
  const { items, status } = useAppointments();
  const holidays = usePlanStore((s) => s.meta?.holidays);
  const next = holidayCountdown(items, today, holidays ?? []);

  const body = () => {
    if (!next) return status === "loading" || status === "idle" ? <BlockSkeleton /> : <BlockEmpty text="Keine Ferien eingetragen" />;
    if (next.running) {
      return (
        <>
          <p className="text-stat text-ink">{t("Frei!")}</p>
          <p className="mt-auto truncate text-body-sm font-semibold text-ink">{next.item.title}</p>
        </>
      );
    }
    return (
      <>
        <p className="flex items-baseline gap-1.5">
          <span className="text-stat text-ink">{next.days}</span>
          <span className="text-body-sm font-semibold text-muted">{t(next.days === 1 ? "Schultag" : "Schultage")}</span>
        </p>
        <p className="mt-auto truncate text-body-sm font-semibold text-ink">{`${t("bis")} ${next.item.title}`}</p>
        {next.progress != null && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
            <div className="h-full rounded-full bg-accent" style={{ width: `${next.progress * 100}%` }} />
          </div>
        )}
      </>
    );
  };

  return (
    <BlockCard kind="countdown" title={t("Countdown")} to="/testen?liste=termine" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default CountdownBlock;
