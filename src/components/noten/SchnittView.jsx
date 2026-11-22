import { ChevronRight, Target } from "lucide-react";
import { useState } from "react";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { useNotenZielStore } from "../../shared/store/notenZielStore";
import { noteNumber } from "../../shared/utils/noten";
import { allSeries, zielInfo, zielKey, ALL } from "../../shared/utils/notenZiel";
import SchnittCard from "./SchnittCard";
import { SubjectRow } from "./SubjectList";
import { ZielStatus } from "./ZielBadge";
import ZielSheet from "./ZielSheet";

// «Ziele in Fächern»: предметы с целью — «jetzt 2,1 · Ziel 2,0» и статус
const ZieleList = ({ subjects, ziele, half }) => {
  const t = useT();
  const rows = subjects.map((s) => ({ s, info: zielInfo(s.list, ziele[zielKey(half, s.code)]) })).filter((x) => x.info);
  if (rows.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Ziele in Fächern")}</h2>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5 py-1">
        {rows.map(({ s, info }) => (
          <SubjectRow
            key={s.code}
            to={`/noten/${s.code}?hj=${half}`}
            code={s.code}
            name={s.name}
            sub={translate("jetzt {now} · Ziel {ziel}", { now: noteNumber(s.average), ziel: noteNumber(info.ziel) })}
            subClassName="font-normal text-faint"
            pill={
              <span className="flex shrink-0 items-center gap-2">
                <ZielStatus status={info.status} />
                <ChevronRight className="size-4 text-faint2" />
              </span>
            }
          />
        ))}
      </ul>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// «Schnitt» (часть 42, макет handy-04): общий ход с общей целью, «Mein Ziel», цели предметов.
// overview — overviewOf(data, half); wide — колонка ПК
// ─────────────────────────────────────────────────────────────
const SchnittView = ({ overview, half, wide }) => {
  const t = useT();
  const [zielOpen, setZielOpen] = useState(false);
  const ziele = useNotenZielStore((s) => s.ziele);
  const goal = ziele[zielKey(half, ALL)];
  const subjects = overview.subjects.length;
  const caption = `${translate("{n} Noten", { n: overview.count })} · ${subjects === 1 ? t("1 Fach") : translate("{n} Fächer", { n: subjects })}`;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3.5">
        <SchnittCard average={overview.average} ziel={goal?.ziel} caption={caption} points={allSeries(overview.subjects)} wide={wide} />
        <button type="button" onClick={() => setZielOpen(true)} className="flex items-center gap-3 rounded-card bg-card px-3.5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand">
          <Target className="size-5 shrink-0 text-muted" />
          <span className="min-w-0 flex-1 text-row text-ink">{t("Mein Ziel")}</span>
          <span className="shrink-0 text-body-sm text-faint">{goal ? noteNumber(goal.ziel) : t("Kein Ziel")}</span>
          <ChevronRight className="size-4 shrink-0 text-faint2" />
        </button>
      </div>
      <ZieleList subjects={overview.subjects} ziele={ziele} half={half} />
      <ZielSheet open={zielOpen} onClose={() => setZielOpen(false)} half={half} subject={null} average={overview.average} />
    </div>
  );
};

export default SchnittView;
