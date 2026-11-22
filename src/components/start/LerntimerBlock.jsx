import { useSubjectName } from "../../shared/hooks/useKarten";
import { useT } from "../../shared/hooks/useT";
import { useTicker } from "../../shared/hooks/useTicker";
import { useLerntimerStore } from "../../shared/store/lerntimerStore";
import { clockText, durationText, localDay, minutesOn, progressOf, remainingMs } from "../../shared/utils/lerntimer";
import { cn } from "../../shared/utils/cn";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";

// ─────────────────────────────────────────────────────────────
// Блок «Lerntimer» (часть 44, макет handy-08).
// Идёт — сколько осталось, предмет и раунд, полоска (на паузе бледнеет); не идёт — сколько сегодня выучено.
// Нажатие — экран таймера
// ─────────────────────────────────────────────────────────────
const LerntimerBlock = ({ editing }) => {
  const t = useT();
  const nameOf = useSubjectName();
  const run = useLerntimerStore((s) => s.run);
  const sessions = useLerntimerStore((s) => s.sessions);
  const now = useTicker(Boolean(run) && !run.pausedAt, 1000);
  const today = minutesOn(sessions, localDay(new Date(now)));

  const body = () => {
    if (!run) {
      if (today === 0) return <BlockEmpty text={t("Heute noch nichts gelernt")} />;
      return (
        <>
          <p className="text-stat text-ink">{durationText(today)}</p>
          <p className="text-body-sm font-semibold text-muted">{t("heute gelernt")}</p>
          <p className="mt-auto truncate text-caption font-bold text-accent-ink">{t("Starten")}</p>
        </>
      );
    }
    const pause = run.phase === "pause";
    return (
      <>
        <p className="flex items-baseline gap-1.5">
          <span className="text-stat text-ink tabular-nums">{clockText(remainingMs(run, now))}</span>
          <span className="text-body-sm font-semibold text-muted">{run.pausedAt ? t("pausiert") : t("noch")}</span>
        </p>
        <p className="mt-auto truncate text-body-sm font-semibold text-ink">{pause ? t("Pause") : t("{fach} · Runde {n}", { fach: nameOf(run.code), n: run.round })}</p>
        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-sand">
          {/* полоска «прошло»: растёт к концу фазы */}
          <span className={cn("block h-full rounded-full transition-[width] duration-700", pause ? "bg-ok" : "bg-accent", run.pausedAt && "opacity-45")} style={{ width: `${(1 - progressOf(run, now)) * 100}%` }} />
        </span>
      </>
    );
  };

  return (
    <BlockCard kind="lerntimer" title={t("Lerntimer")} to="/lerntimer" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default LerntimerBlock;
