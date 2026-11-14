import { ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMaterials } from "../../shared/store/materialsStore";
import { materialMeta } from "../../shared/utils/materials";
import MaterialTile from "./MaterialTile";
import Liquid from "../ui/Liquid";

const SHOWN = 3; // більше — через «Alle»
const NONE = []; // стала порожня відповідь: селектор Zustand не повинен щоразу давати новий масив

// ─────────────────────────────────────────────────────────────
// У вікні уроку (макети handy-09, pc-08): «Materialien · Mathe» — посилання цього предмета.
// Немає посилань (або предмета) — блоку немає. «Alle» — повний список із фільтром.
// ─────────────────────────────────────────────────────────────
const LessonMaterials = ({ subject, overrides }) => {
  const code = subject?.code;
  const all = useMaterials((s) => s.items);
  const ensure = useMaterials((s) => s.ensure);
  // список вантажимо раз за сесію, коли вперше відкрили урок
  useEffect(() => {
    ensure();
  }, [ensure]);

  const items = code ? all.filter((item) => item.subject?.code === code) : NONE;
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-hint font-extrabold text-faint">Materialien · {subject.name ?? code}</h3>
        <Link to={`/materialien?filter=${encodeURIComponent(code)}`} className="text-label font-bold text-accent-ink">
          Alle
        </Link>
      </div>
      <Liquid as="ul" refract press={false} className="divide-y divide-hair rounded-card bg-card px-3">
        {items.slice(0, SHOWN).map((item) => (
          <li key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <MaterialTile item={item} overrides={overrides} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-bold text-ink">{item.title}</span>
                <span className="mt-0.5 block truncate text-note text-faint">{materialMeta(item)}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-faint" aria-hidden="true" />
            </a>
          </li>
        ))}
      </Liquid>
    </section>
  );
};

export default LessonMaterials;
