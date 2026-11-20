import { Link } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { gradeKey, noteNumber } from "../../shared/utils/noten";
import GradePill from "./GradePill";
import NewBadge from "./NewBadge";
import SubjectCell from "./SubjectCell";

// Одна строка: [Ma] Mathematik (neu)          [2,1]
//                   3+ · 2 · 1 · 2-
// sub — вторая строка, pill — плашка справа. selected — выбранный предмет на ПК
export const SubjectRow = ({ to, code, name, isNew, sub, pill, selected }) => (
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
        <span className="mt-0.5 block truncate text-caption font-bold text-muted">{sub}</span>
      </span>
      {pill}
    </Link>
  </li>
);

// «Fächer»: предметы полугодия со своим Schnitt и последними оценками
const SubjectList = ({ subjects, fresh, half, selected }) => {
  const t = useT();
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
            pill={<GradePill text={noteNumber(s.average)} value={s.average} />}
            selected={selected === s.code}
          />
        ))}
      </ul>
    </section>
  );
};

export default SubjectList;
