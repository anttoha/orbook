import { ChevronRight } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { versionLabel } from "../../shared/utils/dayHistory";
import Badge from "../ui/Badge";
import ChangeLine from "./ChangeLine";

// Что показать под временем Fassung
const Changes = ({ entry }) => {
  if (entry.first) return <p className="text-label text-muted">{entry.summary}</p>;
  const { items, hidden, infoChanged } = entry.changes;
  const lines = [...items];
  if (infoChanged) lines.push({ key: "info", kind: "info", title: "Info zum Tag", text: "Neuer Text von der Schule" });
  return (
    <>
      {lines.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {lines.map((item) => (
            <ChangeLine key={item.key} item={item} />
          ))}
        </ul>
      )}
      {hidden > 0 && (
        <p className="text-caption text-faint">
          {lines.length ? "Dazu " : ""}
          {hidden} {hidden === 1 ? "Änderung" : "Änderungen"} in anderen Kursen
        </p>
      )}
      {!lines.length && !hidden && <p className="text-caption text-faint">Nur Kleinigkeiten geändert</p>}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Лента «Verlauf des Tages» (часть 26, макет handy-02 / pc-01): Fassungen новые сверху, слева точки на линии.
// entries — dayHistory(); today — для «Heute 07:12»; onOpen(id) — «Ansehen» у старой Fassung.
// Строки появляются по очереди сверху вниз.
// ─────────────────────────────────────────────────────────────
const VersionTimeline = ({ entries, today, onOpen }) => (
  <ol className="relative rounded-card bg-card px-3.5 py-1">
    {/* линия за точками: от первой точки до последней */}
    {entries.length > 1 && <span aria-hidden="true" className="absolute top-6 bottom-8 left-5.75 w-0.5 rounded-full bg-rule" />}
    {entries.map((entry, i) => (
      <li key={entry.id} style={{ animationDelay: `${i * 90}ms` }} className={cn("relative flex gap-3.5 py-3 motion-safe:animate-rise-in", i > 0 && "before:absolute before:top-0 before:right-0 before:left-8 before:h-px before:bg-hair")}>
        <span aria-hidden="true" className="relative z-10 mt-1 grid size-4.5 shrink-0 place-items-center rounded-full bg-card">
          {entry.current ? (
            <span className="grid size-4.5 place-items-center rounded-full bg-tint">
              <span className="size-2.5 rounded-full bg-accent" />
            </span>
          ) : (
            <span className="size-2.5 rounded-full border-2 border-faint2 bg-card" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="text-row font-extrabold text-ink">{versionLabel(entry.fetchedAt, today)}</p>
            {entry.current && <Badge variant="changed">Aktuell</Badge>}
            {!entry.current && entry.first && <Badge variant="soft">Erste Fassung</Badge>}
            {!entry.current && (
              <button type="button" onClick={() => onOpen(entry.id)} className="-my-1 ml-auto flex items-center gap-0.5 rounded-full py-1 pr-0.5 pl-2 text-label font-bold text-accent-ink hover:bg-tint">
                Ansehen <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>
          <Changes entry={entry} />
        </div>
      </li>
    ))}
  </ol>
);

export default VersionTimeline;
