import { useT } from "../../../shared/hooks/useT";
import { dayDate, dotDate, noteNumber } from "../../../shared/utils/noten";
import { weightTag } from "../../../shared/utils/notenSheet";
import { cn } from "../../../shared/utils/cn";
import { Paper, PaperColumns, PaperGrade, PaperSubject, PaperTiles } from "./SheetParts";

// ─────────────────────────────────────────────────────────────
// Лист A4 «Als PDF» (часть 37): sheet из shared/utils/notenSheet.js.
//   halbjahr  — a4-01: итоги, предметы с каждой оценкой и Schnitt, пропуски
//   zeugnis   — a4-02: Endnoten школы по полугодиям
//   fehlzeiten — a4-03: только пропуски
// klass — «Klasse 9b · Petrischule»; stand — «Stand 16.09.2026 · aus Home.InfoPoint»
// ─────────────────────────────────────────────────────────────
const NotenSheet = ({ sheet, klass, stand }) => {
  const t = useT();
  const year = sheet.year ? ` ${sheet.year}` : "";
  if (sheet.kind === "zeugnis") {
    return (
      <Paper className={klass} title={t("Zeugnis")} sub={sheet.year ? t("Schuljahr {year}", { year: sheet.year }) : null} stand={stand} foot={t("Endnoten setzt die Schule.")}>
        <AbsenceTiles stats={sheet.absences.stats} short />
        <ZeugnisTable subjects={sheet.subjects} />
      </Paper>
    );
  }
  const halfTitle = `${t(`${sheet.half}. Halbjahr`)}${year}`;
  if (sheet.kind === "fehlzeiten") {
    return (
      <Paper className={klass} title={t("Fehlzeiten")} sub={halfTitle} stand={stand}>
        <AbsenceTiles stats={sheet.absences.stats} />
        <AbsenceTable entries={sheet.absences.entries} />
      </Paper>
    );
  }
  const { stats } = sheet.absences;
  return (
    <Paper className={klass} title={t("Noten")} sub={halfTitle} stand={stand} foot={t("Schnitt: von ORBook aus den Einzelnoten berechnet, keine Zeugnisnote.")}>
      <PaperTiles
        items={[
          { label: t("Schnitt"), value: noteNumber(sheet.average) },
          { label: t("Noten"), value: sheet.count, extra: t("in {n} Fächern", { n: sheet.subjects.length }) },
          { label: t("Fehltage"), value: stats.days, extra: stats.unexcused ? t("{n} unentsch.", { n: stats.unexcused }) : null, danger: true },
          { label: t("Fehlstunden"), value: stats.hours },
        ]}
      />
      <GradesTable subjects={sheet.subjects} />
      {sheet.absences.entries.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="mb-2 text-number">{t("Fehlzeiten")}</h2>
          <ShortAbsences entries={sheet.absences.entries} />
        </section>
      )}
    </Paper>
  );
};

const AbsenceTiles = ({ stats, short }) => {
  const t = useT();
  const unexcused = stats.unexcused ? t("{n} unentsch.", { n: stats.unexcused }) : null;
  return (
    <PaperTiles
      items={
        short
          ? [
              { label: t("Fehltage"), value: stats.days, extra: unexcused, danger: true },
              { label: t("Fehlstunden"), value: stats.hours },
            ]
          : [
              { label: t("Fehltage"), value: stats.days },
              { label: t("Fehlstunden"), value: stats.hours },
              { label: t("Unentschuldigt"), value: stats.unexcused },
            ]
      }
    />
  );
};

// Предмет в строку: название, оценки плашками (дата, ×2), справа Schnitt
const GradesTable = ({ subjects }) => {
  const t = useT();
  return (
    <section>
      <PaperColumns>
        <span className="w-50">{t("Fach")}</span>
        <span className="flex-1">{t("Einzelnoten")}</span>
        <span>{t("Schnitt")}</span>
      </PaperColumns>
      {subjects.map((s) => (
        <div key={s.code} className="flex break-inside-avoid items-center gap-3 border-t border-qr-ink/10 py-2">
          <span className="w-47 shrink-0">
            <PaperSubject code={s.code} name={s.name} />
          </span>
          <span className="flex flex-1 flex-wrap gap-2">
            {s.grades.map((g, i) => (
              <span key={i} className="relative w-17 rounded-thumb bg-print-sand px-3 py-1.5">
                <span className="block text-body font-black">{g.grade ?? "–"}</span>
                <span className="block text-micro font-semibold text-qr-ink/45">{dotDate(g.date) || "–"}</span>
                {weightTag(g.weight) && <span className="absolute top-1.5 right-2 text-small font-extrabold text-qr-eye">{weightTag(g.weight)}</span>}
              </span>
            ))}
          </span>
          <PaperGrade text={noteNumber(s.average)} value={s.average} />
        </div>
      ))}
      <div className="border-t border-qr-ink/10" />
    </section>
  );
};

const ZeugnisTable = ({ subjects }) => {
  const t = useT();
  return (
    <section>
      <PaperColumns>
        <span className="flex-1">{t("Fach")}</span>
        <span className="w-32 text-center">{t("1. Halbjahr")}</span>
        <span className="w-32 text-center">{t("2. Halbjahr")}</span>
      </PaperColumns>
      {subjects.map((s) => (
        <div key={s.code} className="flex break-inside-avoid items-center border-t border-qr-ink/10 py-3">
          <span className="min-w-0 flex-1">
            <PaperSubject code={s.code} name={s.name} />
          </span>
          {s.finals.map((f, i) => (
            <span key={i} className="grid w-32 place-items-center">
              <PaperGrade text={f?.grade ?? "–"} value={f?.grade ? f.value : null} />
            </span>
          ))}
        </div>
      ))}
      <div className="border-t border-qr-ink/10" />
    </section>
  );
};

const Status = ({ excused, pill }) => {
  const t = useT();
  if (excused == null) return <span className="text-label text-qr-ink/45">–</span>;
  const text = excused ? t("entschuldigt") : t("unentschuldigt");
  const color = excused ? "text-print-ok" : "text-print-danger";
  if (!pill) return <span className={cn("text-label font-extrabold", color)}>{text}</span>;
  return <span className={cn("rounded-full px-2.5 py-0.5 text-caption font-extrabold", color, excused ? "bg-print-ok-tint" : "bg-print-danger-tint")}>{text}</span>;
};

// Пропуски коротко (на листе полугодия): дата · что · статус
const ShortAbsences = ({ entries }) => (
  <div>
    {entries.map((e, i) => (
      <div key={e.key} className={cn("flex items-baseline gap-3 py-1.5", i && "border-t border-qr-ink/10")}>
        <span className="w-28 shrink-0 text-body-sm font-extrabold">{dayDate(e.date) || "–"}</span>
        <span className="min-w-0 flex-1 text-body-sm text-qr-ink/60">{[e.title, e.sub].filter(Boolean).join(" · ")}</span>
        <Status excused={e.excused} />
      </div>
    ))}
  </div>
);

// Пропуски подробно (лист «Fehlzeiten»)
const AbsenceTable = ({ entries }) => {
  const t = useT();
  if (entries.length === 0) return <p className="text-body text-qr-ink/60">{t("Keine Fehlzeiten")}</p>;
  return (
    <section>
      <PaperColumns>
        <span className="w-34">{t("Datum")}</span>
        <span className="flex-1">{t("Fehlzeit")}</span>
        <span>{t("Status")}</span>
      </PaperColumns>
      {entries.map((e) => (
        <div key={e.key} className="flex break-inside-avoid items-center gap-3 border-t border-qr-ink/10 py-3">
          <span className="w-31 shrink-0 text-body font-extrabold">{dayDate(e.date) || "–"}</span>
          <span className="min-w-0 flex-1 text-body">
            <b className="font-bold">{e.title}</b>
            {e.sub && <span className="text-qr-ink/60">{`  ${e.sub}`}</span>}
          </span>
          <Status excused={e.excused} pill />
        </div>
      ))}
      <div className="border-t border-qr-ink/10" />
    </section>
  );
};

export default NotenSheet;
