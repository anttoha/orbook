import { Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { saveMaterial } from "../../shared/api/materials";
import { usePlanStore } from "../../shared/store/planStore";
import { useMaterials } from "../../shared/store/materialsStore";
import { useUserStore } from "../../shared/store/userStore";
import { MATERIALS_MAX } from "../../shared/utils/entries";
import { subjectName } from "../../shared/utils/format";
import { canShareMaterials, materialMeta, validateMaterialForm } from "../../shared/utils/materials";
import MaterialTile from "../materials/MaterialTile";
import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";
import { CheckIcon } from "../ui/icons";
import { Skeleton } from "../ui/PlanState";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";

// «Neuen Link teilen» прямо в шторке: форма записи остаётся открытой, новая ссылка сразу отмечена
const NewLink = ({ subject, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", url: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-card border border-dashed border-rule px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
        <Link2 className="size-4.5 text-accent-ink" />
        <span className="flex-1 text-body font-extrabold text-accent-ink">Neuen Link teilen</span>
        <span className="text-caption text-faint">Drive · OneDrive</span>
      </button>
    );
  }

  const share = async () => {
    const full = { ...form, subject: subject.code };
    const found = validateMaterialForm(full);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      const { exam: item } = await saveMaterial({
        ...full,
        title: full.title.trim(),
      });
      onSaved(item);
      setForm({ title: "", url: "" });
      setOpen(false);
    } catch (error) {
      setErrors({ url: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-card bg-card p-3.5">
      <TextField id="new-link-title" label="Titel" value={form.title} error={errors.title} autoComplete="off" onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <TextField id="new-link-url" label="Link" value={form.url} error={errors.url} placeholder="https://drive.google.com/…" autoComplete="off" onChange={(event) => setForm({ ...form, url: event.target.value })} />
      <Button variant="primary" disabled={busy} onClick={share}>
        Teilen
      </Button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Шторка «Material anhängen» (макет 24 handy-05): ссылки предмета галочками, не больше 5.
// Ссылки других предметов уже отмеченные (при правке) тоже видны, чтобы их можно было снять.
// ─────────────────────────────────────────────────────────────
const MaterialPickSheet = ({ open, onClose, subject, selected, onDone }) => {
  const items = useMaterials((s) => s.items);
  const status = useMaterials((s) => s.status);
  const ensure = useMaterials((s) => s.ensure);
  const savedLink = useMaterials((s) => s.saved);
  const overrides = useUserStore((s) => s.colorOverrides);
  const me = usePlanStore((s) => s.me);
  const [picked, setPicked] = useState(selected);

  useEffect(() => {
    if (open) ensure();
  }, [open, ensure]);

  const list = items.filter((item) => item.subject?.code === subject?.code || picked.includes(item.id));
  const full = picked.length >= MATERIALS_MAX;
  const toggle = (id, on) => setPicked(on ? [...picked, id] : picked.filter((x) => x !== id));
  const added = (item) => {
    savedLink(item);
    if (!full) setPicked([...picked, item.id]);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      eyebrow={`Materialien · ${subjectName(subject)}`}
      title="Material anhängen"
      footer={
        <Button variant="primary" className="basis-full" onClick={() => onDone(picked)}>
          <CheckIcon className="size-4" /> {picked.length > 0 ? `${picked.length} anhängen` : "Fertig"}
        </Button>
      }
    >
      {status === "loading" && items.length === 0 ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((k) => (
            <Skeleton key={k} className="h-14 rounded-card" />
          ))}
        </div>
      ) : list.length > 0 ? (
        <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
          {list.map((item) => {
            const on = picked.includes(item.id);
            return (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                <MaterialTile item={item} overrides={overrides} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-sm font-bold text-ink">{item.title}</span>
                  <span className="mt-0.5 block truncate text-note text-faint">{materialMeta(item)}</span>
                </span>
                <Checkbox checked={on} disabled={!on && full} onChange={(value) => toggle(item.id, value)} label={<span className="sr-only">{item.title}</span>} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-body-sm text-muted">Für {subjectName(subject)} gibt es noch keine Links.</p>
      )}

      {full && <p className="text-hint text-faint">Höchstens {MATERIALS_MAX} Materialien pro Eintrag.</p>}

      {canShareMaterials(me) && subject && <NewLink subject={subject} onSaved={added} />}
      <p className="text-hint text-faint">Nur Links von Google Drive oder OneDrive — die Dateien bleiben dort, ORBook merkt sich nur den Link.</p>
    </Sheet>
  );
};

export default MaterialPickSheet;
