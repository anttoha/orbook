import { CalendarX, ChevronRight, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { useNotenZielStore } from "../../shared/store/notenZielStore";
import { noteNumber } from "../../shared/utils/noten";
import { allSeries, ALL, zielKey } from "../../shared/utils/notenZiel";
import { translate } from "../../shared/i18n/translate";
import { Sparkline } from "./SchnittChart";

const TILE = "flex min-w-0 flex-col rounded-card bg-card px-3.5 pt-3.5 pb-3";

// Шапка плитки: значок и ПОДПИСЬ (Schnitt — цветом акцента, как в макете)
const TileHead = ({ icon: Icon, title, accent, aside }) => (
  <span className={cn("flex items-center gap-1.5", accent ? "text-accent-ink" : "text-faint")}>
    <Icon className="size-3.5 shrink-0" strokeWidth={2.2} />
    <span className="min-w-0 flex-1 truncate text-small font-extrabold tracking-wide uppercase">{title}</span>
    {aside}
  </span>
);

// Подпись под Schnitt: «Ziel 2,0 · 14 Noten»; без цели — «14 Noten · 7 Fächer»
function schnittLine(overview, goal) {
  const count = translate("{n} Noten", { n: overview.count });
  if (goal) return `${translate("Ziel {note}", { note: noteNumber(goal.ziel) })} · ${count}`;
  const subjects = overview.subjects.length;
  return `${count} · ${subjects === 1 ? translate("1 Fach") : translate("{n} Fächer", { n: subjects })}`;
}

// Две плитки над предметами: «Schnitt» (нажал — ход и цели, часть 42) и «Fehlzeiten» (нажал — список пропусков)
const NotenTiles = ({ overview, absences, half }) => {
  const t = useT();
  const goal = useNotenZielStore((s) => s.ziele[zielKey(half, ALL)]);
  const points = allSeries(overview.subjects);
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link to={`/noten/schnitt?hj=${half}`} className={cn(TILE, "outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand")}>
        <TileHead icon={ClipboardCheck} title={t("Schnitt")} accent aside={<ChevronRight className="size-4 shrink-0 text-faint2" />} />
        <span className="mt-4 flex items-center gap-3">
          <span className="text-stat text-ink">{noteNumber(overview.average)}</span>
          {points.length >= 2 && <Sparkline points={points} />}
        </span>
        <span className="mt-1 truncate text-caption text-faint">{schnittLine(overview, goal)}</span>
      </Link>
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
