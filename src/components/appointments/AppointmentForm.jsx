import { MapPin, UserRound } from "lucide-react";
import { useState } from "react";
import { useExamSave } from "../../shared/hooks/useExamSave";
import { useNow } from "../../shared/hooks/useNow";
import { deleteAppointment, recreateAppointment, saveAppointment } from "../../shared/api/appointments";
import { useAppointmentStore } from "../../shared/store/appointmentsStore";
import { KINDS, NOTE_MAX, TITLE_MAX, appointmentToForm, dateHint, validateAppointmentForm } from "../../shared/utils/appointments";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import ListPicker from "../ui/ListPicker";
import { subjectItems } from "../../shared/utils/picker";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Field from "../ui/Field";
import { CheckIcon, TrashIcon } from "../ui/icons";
import PageHeader from "../ui/PageHeader";
import TextField from "../ui/TextField";

// Як зберігати — для спільного useExamSave (If-Match, 409, «Rückgängig»). admin — шлях адмінки
const opsFor = (admin) => ({
  noun: "Termin",
  listPath: admin ? "/admin/termine" : "/testen?liste=termine",
  savedText: "Gespeichert · die Klasse sieht den Termin",
  save: (form, against) => saveAppointment(form, against, { admin }),
  remove: (item) => deleteAppointment(item, { admin }),
  restore: (item) => recreateAppointment(item, { admin }),
  toForm: appointmentToForm,
  // адмін: список адмінки сам перечитується при поверненні (класовий /api/appointments без входу класу — 401)
  onChanged: admin ? () => {} : (saved) => (saved ? useAppointmentStore.getState().saved(saved) : useAppointmentStore.getState().load()),
});

// Кнопка-вибір як у макеті («Ausflug», «Ganze Klasse»): вибрана — tint і рамка 2px
const Choice = ({ selected, onClick, children }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      "h-9.5 rounded-full border px-3.5 text-label font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
      selected ? "border-2 border-accent bg-tint" : "border-rule",
    )}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────
// Форма терміну (макети 18 handy-03/04, pc-03/04). item = null — новий, інакше правка.
// subjects — предмети для «Für» (учитель — лише свої); eyebrow — хто записує; admin — запис від школи.
// ─────────────────────────────────────────────────────────────
const AppointmentForm = ({ item, subjects, eyebrow, admin = false, authorShort = null }) => {
  const { today } = useNow();
  const [fields, setFields] = useState(() => appointmentToForm(item));
  const [localErrors, setLocalErrors] = useState({});
  const [ops] = useState(() => opsFor(admin));
  const flow = useExamSave(item, ops);
  const errors = { ...localErrors, ...flow.fieldErrors };
  const backTo = ops.listPath;

  const change = (part) => {
    setFields({ ...fields, ...part });
    setLocalErrors(Object.fromEntries(Object.entries(localErrors).filter(([field]) => !(field in part))));
    flow.clearFieldErrors();
  };

  const submit = (force) => {
    const found = validateAppointmentForm(fields, today, item ? { from: item.dateFrom, to: item.dateTo } : null);
    setLocalErrors(found);
    if (Object.keys(found).length > 0) return;
    if (force) flow.overwrite(fields);
    else flow.save(fields);
  };

  const who = admin ? "Die Klasse sieht „eingetragen von der Schule“." : authorShort ? `Die Klasse sieht „eingetragen von ${authorShort}“.` : "Ohne Namen — die Klasse sieht nur den Termin.";
  const audience = fields.subject ? ` Nur Schüler mit dem Kurs ${subjectName(subjects.find((s) => s.code === fields.subject) ?? { code: fields.subject })} sehen ihn.` : "";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(false);
      }}
      noValidate
      className="flex flex-1 flex-col lg:max-w-186"
    >
      <PageHeader backTo={backTo} eyebrow={eyebrow} eyebrowClassName="text-accent-ink" title={item ? "Termin ändern" : "Neuer Termin"} />

      <div className="mt-5 flex flex-col gap-5">
        <Field label="Art" error={errors.kind}>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((kind) => (
              <Choice key={kind.value} selected={fields.kind === kind.value} onClick={() => change({ kind: kind.value })}>
                {kind.label}
              </Choice>
            ))}
          </div>
        </Field>

        <Field label="Für" error={errors.subject}>
          <div className="flex flex-wrap gap-2">
            <Choice selected={!fields.subject} onClick={() => change({ subject: null })}>
              Ganze Klasse
            </Choice>
          </div>
          {/* або один курс: поле зі списком і пошуком (design/neu/19c) */}
          <ListPicker id="appointment-subject" label="Nur für ein Fach" placeholder="Nur für ein Fach …" className="mt-2" items={subjectItems(subjects)} value={fields.subject} clearable clearLabel="Ganze Klasse" onChange={(subject) => change({ subject })} />
          {fields.subject && <p className="mt-2 text-caption text-faint">{subjectName(subjects.find((s) => s.code === fields.subject) ?? { code: fields.subject })}: sehen nur Schüler mit diesem Kurs.</p>}
        </Field>

        <TextField
          id="termin-title"
          label="Titel"
          placeholder="z. B. Exkursion Phänomenta"
          value={fields.title}
          error={errors.title}
          hint={fields.title ? `${fields.title.length} von ${TITLE_MAX} Zeichen · keine Namen von Schülern` : "Keine Namen von Schülern."}
          maxLength={TITLE_MAX}
          onChange={(event) => change({ title: event.target.value })}
        />

        <div className="grid grid-cols-2 gap-2.5 lg:gap-5">
          <TextField id="termin-from" label="Von" type="date" value={fields.dateFrom} error={errors.dateFrom} hint={dateHint(fields.dateFrom, today)} onChange={(event) => change({ dateFrom: event.target.value })} />
          <TextField id="termin-to" label="Bis · optional" type="date" min={fields.dateFrom || undefined} value={fields.dateTo} error={errors.dateTo} hint={fields.dateTo ? null : "Für mehrere Tage"} onChange={(event) => change({ dateTo: event.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:gap-5">
          <TextField id="termin-time-from" label="Uhrzeit · optional" type="time" value={fields.timeFrom} error={errors.timeFrom} hint={errors.timeFrom ? null : "Leer = ganzer Tag."} onChange={(event) => change({ timeFrom: event.target.value })} />
          <TextField id="termin-time-to" label="Bis · optional" type="time" value={fields.timeTo} error={errors.timeTo} onChange={(event) => change({ timeTo: event.target.value })} />
        </div>

        <TextField id="termin-place" label="Ort · optional" placeholder="z. B. Aula" value={fields.place} error={errors.place} maxLength={80} trailing={<MapPin className="size-4.5" />} onChange={(event) => change({ place: event.target.value })} />

        <TextField
          id="termin-note"
          label="Hinweis · optional"
          multiline
          placeholder="z. B. Treffpunkt 07:30 am Bahnhof"
          value={fields.note}
          error={errors.note}
          hint={fields.note ? `${fields.note.length} von ${NOTE_MAX} Zeichen` : null}
          maxLength={NOTE_MAX}
          onChange={(event) => change({ note: event.target.value })}
        />

        <div className="flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted">
          <UserRound className="mt-0.5 size-4 shrink-0" />
          <p>
            {who}
            {audience} Wird nach dem Termin automatisch gelöscht.
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <Button variant="primary" type="submit" disabled={flow.busy} className="flex-none">
          <CheckIcon className="size-4" /> Speichern
        </Button>
        {item?.canDelete && (
          <Button variant="danger" disabled={flow.busy} className="flex-none" onClick={() => flow.setDialog({ kind: "delete" })}>
            <TrashIcon className="size-4" /> Löschen
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={flow.dialog?.kind === "delete"}
        onClose={() => flow.setDialog(null)}
        title="Termin löschen?"
        text={item ? `„${item.title}“ verschwindet für die ganze Klasse – auch aus Woche und Tag.` : ""}
        icon={
          <span className="grid size-11 place-items-center rounded-full bg-danger-tint">
            <TrashIcon className="size-5.5 text-danger" />
          </span>
        }
      >
        <Button onClick={() => flow.setDialog(null)}>Abbrechen</Button>
        <Button variant="danger" disabled={flow.busy} onClick={flow.remove}>
          <TrashIcon className="size-4" /> Löschen
        </Button>
      </ConfirmDialog>
      <ConfirmDialog open={flow.dialog?.kind === "conflict"} onClose={() => flow.setDialog(null)} title="Der Termin wurde inzwischen geändert." text={flow.dialog?.exam ? `Jetzt: »${flow.dialog.exam.title}«` : ""}>
        <Button variant="primary" className="flex-none basis-full" onClick={() => submit(true)}>
          Meine Änderung trotzdem speichern
        </Button>
        <Button className="flex-none basis-full" onClick={flow.discard}>
          Verwerfen
        </Button>
      </ConfirmDialog>
    </form>
  );
};

export default AppointmentForm;
