import { Link } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { useNotenZielStore } from "../../shared/store/notenZielStore";
import { gradeKey, noteNumber } from "../../shared/utils/noten";
import { zielInfo, zielKey } from "../../shared/utils/notenZiel";
import GradePill from "./GradePill";
import NewBadge from "./NewBadge";
import SubjectCell from "./SubjectCell";
import { ZielChip } from "./ZielBadge";

// Одна строка: [Ma] Mathematik (neu)          [2,1]
//                   3+ · 2 · 1 · 2-
// sub — вторая строка, pill — плашка справа. selected — выбранный предмет на ПК
export const SubjectRow = ({ to, code, name, isNew, sub, subClassName = "font-bold text-muted", pill, selected }) => (
  <li>
    <Link
      to={to}
      className={cn(
        "-mx-2 flex items-center gap-3 rounded-field px-2 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand",
        selected && "bg-tint",
      )}
    >
      <SubjectCell code={code} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-row font-extrabold text-ink">{name}</span>
          {isNew && <NewBadge />}
        </span>
        <span className={cn("mt-0.5 block truncate text-caption", subClassName)}>{sub}</span>
      </span>
      {pill}
    </Link>
  </li>
);

// Справа: «Ziel 2,0» (если есть цель) и Schnitt
const SubjectPill = ({ subject, info }) => (
  <span className="flex shrink-0 items-center gap-2">
    {info && <ZielChip info={info} />}
    <GradePill text={noteNumber(subject.average)} value={subject.average} />
  </span>
);

// «Fächer»: предметы полугодия со своим Schnitt и последними оценками; с целью — «Ziel 2,0» цветом статуса (часть 42)
const SubjectList = ({ subjects, fresh, half, selected }) => {
  const t = useT();
  const ziele = useNotenZielStore((s) => s.ziele);
  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Fächer")}</h2>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5 py-1">
        {subjects.map((s) => (
          <SubjectRow
            key={s.code}
            to={`/noten/${s.code}?hj=${half}`}
            code={s.code}
            name={s.name}
            isNew={s.list.some((g) => fresh.includes(gradeKey(s.code, g)))}
            sub={s.list.map((g) => g.grade ?? "–").join("  ·  ")}
            pill={<SubjectPill subject={s} info={zielInfo(s.list, ziele[zielKey(half, s.code)])} />}
            selected={selected === s.code}
          />
        ))}
      </ul>
    </section>
  );
};

export default SubjectList;
