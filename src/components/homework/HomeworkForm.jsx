import { useState } from "react";
import { UserRound } from "lucide-react";
import { HOMEWORK_OPS, useExamSave } from "../../shared/hooks/useExamSave";
import { useNow } from "../../shared/hooks/useNow";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { formEyebrow, formSubjects, isTeacher, validateExamDate } from "../../shared/utils/examRules";
import { addDays, numericDate, subjectName, weekdayShort } from "../../shared/utils/format";
import { dueHint, homeworkToForm, nextLessonDate, TEXT_MAX, validateHomeworkForm } from "../../shared/utils/homework";
import ListPicker from "../ui/ListPicker";
import { mySubjectCodes, subjectItems } from "../../shared/utils/picker";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Field from "../ui/Field";
import { CheckIcon, TrashIcon } from "../ui/icons";
import PageHeader from "../ui/PageHeader";
import TextField from "../ui/TextField";
import StudentsMayEdit from "./StudentsMayEdit";


const quick = "h-8.5 rounded-full border border-rule px-3.5 text-hint font-bold text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent/50";
const label = (item) => `${subjectName(item.subject)} · bis ${weekdayShort(item.due)} ${numericDate(item.due)}`;

// Швидкі дати під полем: «Nächste Stunde · Do» (якщо урок предмета є в завантажених тижнях) і «In 1 Woche»
const QuickDates = ({ subject, today, onPick }) => {
  const weeks = usePlanStore((s) => s.weeks);
  const days = Object.values(weeks).flatMap((week) => week.data?.days ?? []);
  const next = nextLessonDate(days, subject, today);
  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {next && (
        <button type="button" className={quick} onClick={() => onPick(next)}>
          Nächste Stunde · {weekdayShort(next)}
        </button>
      )}
      <button type="button" className={quick} onClick={() => onPick(addDays(today, 7))}>
        In 1 Woche
      </button>
    </div>
  );
};

// Діалоги поверх форми: видалити і «запис уже змінили»
const Dialogs = ({ flow, item, form }) => {
  const { dialog, setDialog } = flow;
  const close = () => setDialog(null);
  return (
    <>
      <ConfirmDialog open={dialog?.kind === "delete"} onClose={close} icon={<TrashIcon className="size-6.5 text-danger" />} title="Hausaufgabe löschen?" text={item ? `»${label(item)}« verschwindet für die ganze Klasse.` : ""}>
        <Button onClick={close}>Abbrechen</Button>
        <Button variant="danger" onClick={flow.remove}>
          <TrashIcon className="size-4" /> Löschen
        </Button>
      </ConfirmDialog>
      <ConfirmDialog open={dialog?.kind === "conflict"} onClose={close} title="Die Hausaufgabe wurde inzwischen geändert." text={dialog?.exam ? `Jetzt: »${label(dialog.exam)}« · ${dialog.exam.text ?? ""}` : ""}>
        <Button variant="primary" className="flex-none basis-full" onClick={() => flow.overwrite(form)}>
          Meine Änderung trotzdem speichern
        </Button>
        <Button className="flex-none basis-full" onClick={flow.discard}>
          Verwerfen
        </Button>
      </ConfirmDialog>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Форма Hausaufgabe (макети handy-06, pc-03). item = null — нова, інакше правка.
// Відповіді сервера — той самий useExamSave (HOMEWORK_OPS): If-Match, 409, «Rückgängig».
// ─────────────────────────────────────────────────────────────
const HomeworkForm = ({ item }) => {
  const { today } = useNow();
  const me = usePlanStore((s) => s.me);
  const meta = usePlanStore((s) => s.meta);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const teacher = isTeacher(me);
  // нова Hausaufgabe — за замовчуванням «bis morgen» (як у макеті handy-06)
  const [fields, setFields] = useState(() => (item ? homeworkToForm(item) : { ...homeworkToForm(null), due: addDays(today, 1) }));
  const [localErrors, setLocalErrors] = useState({});
  const flow = useExamSave(item, HOMEWORK_OPS);

  const subjects = formSubjects(courses, picked, meta?.subjects, item?.subject);
  const { studentsMayEdit, ...plain } = fields;
  const form = { ...plain, text: fields.text.trim(), ...(teacher ? { studentsMayEdit } : {}) }; // studentsMayEdit — лише від учителя
  const errors = { ...localErrors, ...flow.fieldErrors };

  const change = (part) => {
    setFields({ ...fields, ...part });
    setLocalErrors(Object.fromEntries(Object.entries(localErrors).filter(([field]) => !(field in part))));
    flow.clearFieldErrors();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateHomeworkForm(form, today, validateExamDate, item?.due);
    setLocalErrors(found);
    if (Object.keys(found).length === 0) flow.save(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col lg:max-w-186">
      <PageHeader backTo="/testen?liste=hausaufgaben" eyebrow={formEyebrow(me, "Hausaufgabe eintragen")} eyebrowClassName="text-accent-ink" title={item ? "Hausaufgabe ändern" : "Neue Hausaufgabe"} />

      <div className="mt-5 flex flex-col gap-5">
        <Field label="Fach" error={errors.subject}>
          <ListPicker id="homework-subject" label="Fach" items={subjectItems(subjects, mySubjectCodes(courses, picked), courses)} value={fields.subject} error={Boolean(errors.subject)} onChange={(subject) => change({ subject })} />
        </Field>

        <div>
          <TextField id="homework-due" label="Abgabe bis" type="date" value={fields.due} error={errors.due} hint={dueHint(fields.due, today)} onChange={(event) => change({ due: event.target.value })} />
          <QuickDates subject={fields.subject} today={today} onPick={(due) => change({ due })} />
        </div>

        <TextField
          id="homework-text"
          label="Aufgabe"
          multiline
          rows={3}
          value={fields.text}
          error={errors.text}
          hint={`${fields.text.length} von ${TEXT_MAX} Zeichen · keine Namen von Schülern`}
          maxLength={TEXT_MAX}
          onChange={(event) => change({ text: event.target.value })}
        />

        {teacher && <StudentsMayEdit checked={studentsMayEdit} onChange={(value) => change({ studentsMayEdit: value })} note="An: Schüler mit Freigabe dürfen Abgabe und Text ändern." />}

        <div className="flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted">
          <UserRound className="size-4 shrink-0" />
          <p>{teacher ? `Die Klasse sieht „eingetragen von ${me.teacher.short}“. Wird nach der Abgabe automatisch gelöscht.` : "Ohne Namen. Wird nach der Abgabe automatisch gelöscht."}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <Button variant="primary" type="submit" disabled={flow.busy} className="flex-none">
          <CheckIcon className="size-4" /> Speichern
        </Button>
        {item && item.canDelete !== false && (
          <Button variant="danger" disabled={flow.busy} className="flex-none" onClick={() => flow.setDialog({ kind: "delete" })}>
            <TrashIcon className="size-4" /> Löschen
          </Button>
        )}
      </div>

      <Dialogs flow={flow} item={item} form={form} />
    </form>
  );
};

export default HomeworkForm;
