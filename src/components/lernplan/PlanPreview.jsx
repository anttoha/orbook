import { shortDay } from "../../shared/utils/lernplan";

// «So lernst du» (макет 41 handy-02): какой день — какая тема. Пересчитывается при каждом изменении
const PlanPreview = ({ rows }) => (
  <ol className="divide-y divide-hair rounded-card bg-card px-4">
    {rows.map((row) => (
      <li key={row.date} className="flex min-h-12 items-center gap-3 py-2">
        <span className="w-16 shrink-0 text-caption font-bold text-faint">{shortDay(row.date)}</span>
        <span className="min-w-0 flex-1 text-row font-bold text-ink">{row.text}</span>
      </li>
    ))}
  </ol>
);

export default PlanPreview;
