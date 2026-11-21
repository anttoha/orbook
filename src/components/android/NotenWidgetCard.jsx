import { CalendarX, ClipboardCheck, Star } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useNotenStore } from "../../shared/store/notenStore";
import { dayDate, dotDate, noteNumber } from "../../shared/utils/noten";
import { HIDDEN, notenWidget } from "../../shared/utils/notenWidget";
import { cn } from "../../shared/utils/cn";
import GradePill from "../noten/GradePill";
import NewBadge from "../noten/NewBadge";

// ─────────────────────────────────────────────────────────────
// Часть 39: превью виджетов «Noten», «Neue Noten», «Fehlzeiten» в «Widget einstellen» (макет 39 handy-06).
// Данные — кеш Noten на этом устройстве; show = «Noten anzeigen», иначе вместо оценок и чисел «•••».
// Сам виджет рисует Android (NotenKinds.kt) — здесь короткий образец, а не точная копия всех размеров
// ─────────────────────────────────────────────────────────────
const HEAD = { noten: [ClipboardCheck, "Noten", true], neueNoten: [Star, "Neue Noten", true], fehlzeiten: [CalendarX, "Fehlzeiten", false] };
const ROWS = 4;

// Оценка или «•••» в той же плашке (скрытая — нейтрального цвета)
const Grade = ({ text, value, show }) => <GradePill text={show ? text : HIDDEN} value={show ? value : null} className="h-6.5 min-w-11 text-caption font-black" />;

const Name = ({ name, fresh }) => (
  <span className="flex min-w-0 flex-1 items-center gap-1.5">
    <span className="truncate text-body-sm font-extrabold text-ink">{name}</span>
    {fresh && <NewBadge />}
  </span>
);

const Noten = ({ w, show }) => {
  const t = useT();
  return (
    <>
      <p className="flex items-baseline gap-1.5">
        <span className={cn("text-stat", show ? "text-ink" : "text-faint")}>{show ? noteNumber(w.average) : HIDDEN}</span>
        <span className="text-body-sm font-semibold text-muted">{t("Schnitt")}</span>
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 border-t border-hair">
        {w.subjects.slice(0, ROWS).map((s) => (
          <li key={s.code} className="flex h-8 items-center gap-2 border-b border-hair">
            <Name name={s.name} fresh={s.fresh} />
            <Grade text={noteNumber(s.average)} value={s.average} show={show} />
          </li>
        ))}
      </ul>
    </>
  );
};

const NeueNoten = ({ w, show }) => (
  <ul>
    {w.latest.slice(0, ROWS).map((x, i) => (
      <li key={`${x.code}-${x.date}-${i}`} className="flex h-8 items-center gap-2 border-b border-hair last:border-0">
        <Name name={x.subject} fresh={x.fresh} />
        <span className="truncate text-caption text-faint">{[x.what, dayDate(x.date)].filter(Boolean).join(" · ")}</span>
        <Grade text={x.grade} value={x.value} show={show} />
      </li>
    ))}
  </ul>
);

const Fehlzeiten = ({ w, show }) => {
  const t = useT();
  const tiles = [
    [w.absences.days, "Fehltage", false],
    [w.absences.hours, "Fehlstunden", false],
    [w.absences.unexcused, "unentschuldigt", w.absences.unexcused > 0],
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiles.map(([n, label, bad]) => (
        <div key={label} className="min-w-0 rounded-tile bg-sand px-3 py-2.5">
          <p className={cn("text-stat", !show ? "text-faint" : bad ? "text-danger" : "text-ink")}>{show ? n : HIDDEN}</p>
          <p className="truncate text-small font-bold text-muted">{t(label)}</p>
        </div>
      ))}
    </div>
  );
};

const BODY = { noten: Noten, neueNoten: NeueNoten, fehlzeiten: Fehlzeiten };

const NotenWidgetCard = ({ kind, show }) => {
  const t = useT();
  const data = useNotenStore((s) => s.data);
  const fresh = useNotenStore((s) => s.fresh);
  const [Icon, title, accent] = HEAD[kind];
  const Body = BODY[kind];
  const w = data ? notenWidget(data, fresh) : null;
  return (
    <div className="flex min-h-40 w-full min-w-0 flex-col rounded-card bg-card px-3.5 pt-3.5 pb-3">
      <header className={cn("flex items-center gap-1.5", accent ? "text-accent-ink" : "text-faint")}>
        <Icon className="size-3.5 shrink-0" strokeWidth={2.2} />
        <span className="min-w-0 flex-1 truncate text-small font-extrabold tracking-wide uppercase">{t(title)}</span>
        {w?.stand && <span className="shrink-0 text-caption font-bold text-faint">{t("Stand {date}", { date: dotDate(w.stand) })}</span>}
      </header>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        {w ? <Body w={w} show={show} /> : <p className="m-auto text-body-sm font-extrabold text-ink">{t("In ORBook bei Noten anmelden")}</p>}
      </div>
    </div>
  );
};

export default NotenWidgetCard;
