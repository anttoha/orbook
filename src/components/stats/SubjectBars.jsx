import { useUserStore } from "../../shared/store/userStore";
import { subjectCode, subjectName } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import { barRows } from "../../shared/utils/stats";

// Рядок: кружечок предмета, назва, смужка, число. Колір — з «Fachfarben» учня
const SubjectRow = ({ row, colorClass }) => (
  <li className="flex h-5 items-center gap-2.5">
    <span className={`size-2.25 shrink-0 rounded-full ${colorClass}`} />
    <span className="w-19 shrink-0 truncate text-nav text-ink">{subjectName(row.subject)}</span>
    <span className="h-2.25 flex-1 overflow-hidden rounded-full bg-sand">
      <span className={`block h-full rounded-full ${colorClass}`} style={{ width: `${row.pct}%` }} />
    </span>
    <span className="w-8 shrink-0 text-right text-label font-bold text-ink">{row.value}</span>
  </li>
);

// Список «Fällt am häufigsten aus» або «Klausuren nach Fach». valueKey — яке поле рахувати.
// Порожній список не показуємо зовсім
const SubjectBars = ({ title, items, valueKey }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  const rows = barRows(items, valueKey);
  if (rows.length === 0) return null;

  return (
    <section>
      <h2 className="text-hint font-extrabold text-faint">{title}</h2>
      <ul className="mt-3.5 flex flex-col gap-2.25">
        {rows.map((row) => (
          <SubjectRow key={subjectCode(row.subject)} row={row} colorClass={fachDotClass(row.subject?.code, overrides)} />
        ))}
      </ul>
    </section>
  );
};

export default SubjectBars;
