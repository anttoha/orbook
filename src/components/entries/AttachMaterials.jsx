import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useMaterials } from "../../shared/store/materialsStore";
import { useUserStore } from "../../shared/store/userStore";
import { materialMeta } from "../../shared/utils/materials";
import MaterialTile from "../materials/MaterialTile";
import Field from "../ui/Field";
import MaterialPickSheet from "./MaterialPickSheet";

// ─────────────────────────────────────────────────────────────
// «Materialien · optional» в форме Test / Hausaufgabe (часть 21 внутри 24, макеты handy-04, 06).
// value — id ссылок; known — ссылки, которые уже пришли с записью (их может не быть в общем списке).
// ─────────────────────────────────────────────────────────────
const AttachMaterials = ({ subject, value, known = [], error, onChange }) => {
  const items = useMaterials((s) => s.items);
  const overrides = useUserStore((s) => s.colorOverrides);
  const [open, setOpen] = useState(false);
  // полная ссылка из списка (с предметом и автором), иначе то, что пришло с записью
  const attached = value
    .map(
      (id) =>
        items.find((item) => item.id === id) ?? {
          ...known.find((item) => item.id === id),
          subject,
        },
    )
    .filter((item) => item.id != null);

  const done = (ids) => {
    onChange(ids);
    setOpen(false);
  };

  return (
    <Field label="Materialien · optional" error={error}>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
        {attached.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2.5">
            <MaterialTile item={item} overrides={overrides} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-sm font-bold text-ink">{item.title}</span>
              <span className="mt-0.5 block truncate text-note text-faint">{materialMeta(item)}</span>
            </span>
            <button
              type="button"
              aria-label={`${item.title} entfernen`}
              onClick={() => onChange(value.filter((id) => id !== item.id))}
              className="grid size-9 place-items-center rounded-full text-faint outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <X className="size-4.5" />
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            disabled={!subject}
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-3 py-3.5 text-left text-body font-extrabold text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:text-faint"
          >
            <Plus className="size-4.5" /> Material anhängen
          </button>
        </li>
      </ul>
      {/* key: при каждом открытии галочки — из текущего значения формы */}
      {open && <MaterialPickSheet key={value.join(",")} open={open} onClose={() => setOpen(false)} subject={subject} selected={value} onDone={done} />}
    </Field>
  );
};

export default AttachMaterials;
