import { useState } from "react";
import { validateType } from "../../../shared/utils/examTypes";
import Button from "../../ui/Button";
import { CheckIcon, FlagIcon, TrashIcon } from "../../ui/icons";
import Sheet from "../../ui/Sheet";
import TextField from "../../ui/TextField";

// Как Kürzel выглядит в клетке недели (макет 24 handy-11): «Ge / 108» и бейдж в углу
const WeekPreview = ({ short }) => (
  <div className="flex items-center gap-3">
    <span className="text-caption text-faint">In der Woche:</span>
    <span className="relative flex h-14 w-16 flex-col justify-between rounded-cell bg-sand px-2 py-2">
      <span className="text-hint font-black text-ink">Ge</span>
      <span className="text-nano font-extrabold text-accent-ink">{short.trim() || "?"}</span>
      <span className="absolute top-px right-px grid place-items-center rounded-tr-cell rounded-bl-chip bg-accent p-1.25 text-on-accent">
        <FlagIcon className="size-2.5" strokeWidth={3} />
      </span>
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// «Art bearbeiten» / «Art hinzufügen» (макет 24 handy-11). index = null — новая Art.
// onSave(form) — сохранить строку; onDelete — спросить, что делать с записями (страница)
// ─────────────────────────────────────────────────────────────
const ExamTypeSheet = ({ open, onClose, rows, index, busy, onSave, onDelete }) => {
  const row = index == null ? null : rows[index];
  const [form, setForm] = useState({ name: row?.name ?? "", short: row?.short ?? "" });
  const [errors, setErrors] = useState({});

  const save = () => {
    const found = validateType(form, rows, index);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave(form);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      eyebrow="Arten von Tests"
      title={row ? "Art bearbeiten" : "Art hinzufügen"}
      footer={
        <div className="flex w-full flex-col gap-2.5">
          <Button variant="primary" className="flex-none" disabled={busy} onClick={save}>
            <CheckIcon className="size-4" /> Speichern
          </Button>
          {/* последний вид удалить нельзя: сервер требует хотя бы один */}
          {row && rows.length > 1 && (
            <Button variant="danger" className="flex-none" disabled={busy} onClick={onDelete}>
              <TrashIcon className="size-4" /> Löschen
            </Button>
          )}
        </div>
      }
    >
      <TextField id="type-name" label="Name" value={form.name} error={errors.name} maxLength={40} autoComplete="off" onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <div className="flex flex-wrap items-end gap-4">
        <TextField id="type-short" label="Kürzel · bis 4 Zeichen" className="w-32" value={form.short} error={errors.short} maxLength={4} autoComplete="off" onChange={(event) => setForm({ ...form, short: event.target.value })} />
        <WeekPreview short={form.short} />
      </div>
    </Sheet>
  );
};

export default ExamTypeSheet;
