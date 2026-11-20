import { CalendarX, ChevronRight, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { noteNumber } from "../../shared/utils/noten";
import { translate } from "../../shared/i18n/translate";

const TILE = "flex min-w-0 flex-col rounded-card bg-card px-3.5 pt-3.5 pb-3";

// Шапка плитки: значок и ПОДПИСЬ (Schnitt — цветом акцента, как в макете)
const TileHead = ({ icon: Icon, title, accent, aside }) => (
  <span className={cn("flex items-center gap-1.5", accent ? "text-accent-ink" : "text-faint")}>
    <Icon className="size-3.5 shrink-0" strokeWidth={2.2} />
    <span className="min-w-0 flex-1 truncate text-small font-extrabold tracking-wide uppercase">{title}</span>
    {aside}
  </span>
);

// Две плитки над предметами: «Schnitt» (расчёт) и «Fehlzeiten» (нажал — список пропусков)
const NotenTiles = ({ overview, absences }) => {
  const t = useT();
  const subjects = overview.subjects.length;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className={TILE}>
        <TileHead icon={ClipboardCheck} title={t("Schnitt")} accent />
        <span className="mt-4 text-stat text-ink">{noteNumber(overview.average)}</span>
        <span className="mt-1 truncate text-caption text-faint">
          {translate("{n} Noten", { n: overview.count })} · {subjects === 1 ? t("1 Fach") : translate("{n} Fächer", { n: subjects })}
        </span>
      </div>
      <Link to="/fehlzeiten" className={cn(TILE, "outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand")}>
        <TileHead icon={CalendarX} title={t("Fehlzeiten")} aside={<ChevronRight className="size-4 shrink-0 text-faint2" />} />
        <span className="mt-4 flex items-baseline gap-1.5">
          <span className="text-stat text-ink">{absences.days}</span>
          <span className="text-lead font-bold text-muted">{absences.days === 1 ? t("Tag") : t("Tage")}</span>
        </span>
        <span className="mt-1 truncate text-caption text-faint">
          {translate("{n} Std.", { n: absences.hours })}
          {absences.unexcused > 0 && <span className="font-bold text-danger"> · {translate("{n} unentsch.", { n: absences.unexcused })}</span>}
        </span>
      </Link>
    </div>
  );
};

export default NotenTiles;
