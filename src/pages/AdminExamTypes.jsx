import { GripVertical, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import AdminHeader from "../components/admin/AdminHeader";
import { AdminError, AdminSkeleton } from "../components/admin/AdminState";
import DeleteTypeDialog from "../components/admin/examTypes/DeleteTypeDialog";
import ExamTypeSheet from "../components/admin/examTypes/ExamTypeSheet";
import OptionRow from "../components/admin/settings/OptionRow";
import Button from "../components/ui/Button";
import { PencilIcon } from "../components/ui/icons";
import Switch from "../components/ui/Switch";
import { loadExamTypes, saveExamTypes, saveSettings } from "../shared/api/admin";
import { useAdminLoad } from "../shared/hooks/useAdminLoad";
import { countText, moveRow, toPayload, toRows } from "../shared/utils/examTypes";
import RoundButton from "../components/ui/RoundButton";
import Liquid from "../components/ui/Liquid";

// Строка вида: «⋮⋮» тянуть (порядок), имя, Kürzel, сколько записей, ✎
const TypeRow = ({ row, onEdit, onGrab, rowRef }) => (
  <li ref={rowRef} className="flex items-center gap-2.5 py-3">
    {/* touch-none: палец тянет строку, а не страницу */}
    <button type="button" aria-label={`${row.name} verschieben`} onPointerDown={onGrab} className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-field text-faint2 outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
      <GripVertical className="size-4.5" />
    </button>
    <div className="min-w-0 flex-1">
      <p className="truncate text-body font-extrabold text-ink">{row.name}</p>
      <p className="mt-1 flex items-center gap-2 text-caption text-faint">
        <span className="rounded-full bg-sand px-2 py-0.5 text-room font-extrabold tracking-badge text-muted">{row.short}</span>
        {countText(row.count)}
      </p>
    </div>
    <RoundButton aria-label={`${row.name} bearbeiten`} onClick={onEdit} look="grid size-9 shrink-0 place-items-center rounded-full text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
      <PencilIcon className="size-4.5" />
    </RoundButton>
  </li>
);

// ─────────────────────────────────────────────────────────────
// Admin · «Arten von Tests» (часть 24, макеты handy-10…12, pc-03): виды записей с Kürzel, порядок,
// переименование и удаление с заменой; переключатели авто-переноса, если урок выпал.
// Каждое изменение сразу уходит на сервер (весь список — PUT /api/admin/exam-types).
// ─────────────────────────────────────────────────────────────
const AdminExamTypes = () => {
  const data = useAdminLoad("examTypes", loadExamTypes);
  // Порядок во время перетаскивания и до ответа сервера; новый ответ сервера (data.data) его заменяет
  const [draft, setDraft] = useState({ source: null, rows: null });
  const rows = draft.source === data.data && draft.rows ? draft.rows : data.data ? toRows(data.data.types) : null;
  const setRows = (next) => setDraft({ source: data.data, rows: next });
  const [editing, setEditing] = useState(undefined); // undefined — окно закрыто, null — новая Art, число — строка
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const rowRefs = useRef([]);

  const store = async (next, replaceWith = {}) => {
    setBusy(true);
    try {
      await saveExamTypes(toPayload(next), replaceWith);
      data.reload(); // новые строки придут с ответом
      return true;
    } catch (error) {
      toast.error(error.message);
      data.reload(); // вернуть то, что на сервере
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Перетаскивание за «⋮⋮»: строка встаёт туда, над чьей серединой палец; сохраняем, когда отпустили
  const grab = (index) => (event) => {
    event.preventDefault();
    let from = index;
    let current = rows;
    const move = (e) => {
      const to = rowRefs.current.findIndex((el) => el && e.clientY < el.getBoundingClientRect().bottom);
      const target = to === -1 ? current.length - 1 : to;
      if (target !== from) {
        current = moveRow(current, from, target);
        from = target;
        setRows(current);
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (current !== rows) store(current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const saveRow = async (form) => {
    const next = editing == null ? [...rows, { ...form, count: 0, was: null }] : rows.map((row, k) => (k === editing ? { ...row, ...form } : row));
    if (await store(next)) setEditing(undefined);
  };

  const remove = async (replacement) => {
    const next = rows.filter((row) => row !== deleting);
    if (await store(next, replacement ? { [deleting.was]: replacement } : {})) {
      toast.success(`„${deleting.name}“ gelöscht`);
      setDeleting(null);
      setEditing(undefined);
    }
  };

  const toggle = async (key, value) => {
    try {
      await saveSettings({ [key]: { autoMove: value } });
      data.reload();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderBody = () => {
    if (!rows && data.status === "error") return <AdminError error={data.error} onRetry={data.reload} />;
    if (!rows) return <AdminSkeleton rows={4} />;
    return (
      <>
        <Liquid as="ul" refract press={false} className="divide-y divide-hair rounded-card bg-card px-3.5">
          {rows.map((row, k) => (
            <TypeRow key={row.was ?? row.name} row={row} rowRef={(el) => (rowRefs.current[k] = el)} onGrab={grab(k)} onEdit={() => setEditing(k)} />
          ))}
        </Liquid>
        <Button variant="tint" className="flex-none" disabled={busy || rows.length >= 12} onClick={() => setEditing(null)}>
          <Plus className="size-4.5" /> Art hinzufügen
        </Button>

        <section>
          <h2 className="mb-2.5 text-hint font-extrabold text-faint">Wenn eine Stunde ausfällt</h2>
          <div className="flex flex-col gap-2.5">
            <Liquid as="div" refract press={false} className="rounded-card bg-card px-3.5">
              <OptionRow label="Tests verschieben" hint="auf die nächste Stunde des Fachs">
                <Switch checked={data.data?.examsAutoMove ?? true} label="Tests verschieben" onChange={(value) => toggle("exams", value)} />
              </OptionRow>
            </Liquid>
            <Liquid as="div" refract press={false} className="rounded-card bg-card px-3.5">
              <OptionRow label="Hausaufgaben verschieben" hint="Abgabe rutscht mit, wenn sie an der Stunde hängt">
                <Switch checked={data.data?.homeworkAutoMove ?? true} label="Hausaufgaben verschieben" onChange={(value) => toggle("homework", value)} />
              </OptionRow>
            </Liquid>
          </div>
          <p className="mt-2.5 text-caption text-faint">Verschobene Einträge zeigen „verschoben von …“.</p>
        </section>
      </>
    );
  };

  return (
    <section className="flex flex-col gap-4 lg:max-w-186 lg:gap-5">
      <AdminHeader title="Arten von Tests" backTo="/admin/einstellungen" />
      <p className="text-body-sm text-faint">So heißen die Einträge in Tests, Woche und Tag. Kürzel stehen in der Woche. Ziehen = Reihenfolge.</p>
      {renderBody()}

      {editing !== undefined && rows && (
        <ExamTypeSheet key={editing ?? "neu"} open onClose={() => setEditing(undefined)} rows={rows} index={editing} busy={busy} onSave={saveRow} onDelete={() => setDeleting(rows[editing])} />
      )}
      {deleting && <DeleteTypeDialog row={deleting} others={rows.filter((row) => row !== deleting).map((row) => row.name)} busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />}
    </section>
  );
};

export default AdminExamTypes;
