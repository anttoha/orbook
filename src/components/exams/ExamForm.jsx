import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExamSave } from "../../shared/hooks/useExamSave";
import { useNow } from "../../shared/hooks/useNow";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { examLabel, examToForm, formEyebrow, formSubjects, isTeacher, TOPIC_MAX, validateExamForm } from "../../shared/utils/examRules";
import StudentsMayEdit from "../homework/StudentsMayEdit";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Field from "../ui/Field";
import { CheckIcon, TrashIcon } from "../ui/icons";
import PageHeader from "../ui/PageHeader";
import Segmented from "../ui/Segmented";
import TextField from "../ui/TextField";
import SubjectToggle from "./SubjectToggle";

// Поки meta не прийшла: значення за замовчуванням із docs/API.md
const DEFAULT_TYPES = ["Klausur", "Test", "Abgabe"];
const DEFAULT_LESSONS = [1, 2, 3, 4, 5, 6];

// Кружечок з номером уроку
const LessonButton = ({ lesson, selected, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn("grid size-10.5 place-items-center rounded-full border text-body-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50", selected ? "border-accent bg-accent text-on-accent" : "border-rule text-muted")}
  >
    {lesson}
  </button>
);

// Діалоги поверх форми: видалити, такий запис уже є, запис уже змінили
const ExamDialogs = ({ flow, exam, form }) => {
  const navigate = useNavigate();
  const { dialog, setDialog } = flow;
  const close = () => setDialog(null);
  const trash = <TrashIcon className="size-6.5 text-danger" />;

  return (
    <>
      <ConfirmDialog open={dialog?.kind === "delete"} onClose={close} icon={trash} title="Klausur löschen?" text={exam ? `»${examLabel(exam)}« verschwindet für die ganze Klasse.` : ""}>
        <Button onClick={close}>Abbrechen</Button>
        <Button variant="danger" onClick={flow.remove}>
          <TrashIcon className="size-4" /> Löschen
        </Button>
      </ConfirmDialog>

      <ConfirmDialog open={dialog?.kind === "duplicate"} onClose={close} title="Es gibt schon einen Eintrag" text={dialog?.exam ? `»${examLabel(dialog.exam)}«${dialog.exam.topic ? ` · ${dialog.exam.topic}` : ""}` : ""}>
        <Button onClick={() => navigate(`/testen?sheet=klausur&id=${dialog.exam.id}`)}>Ansehen</Button>
        <Button variant="primary" onClick={() => flow.save(form, { force: true })}>
          Trotzdem eintragen
        </Button>
      </ConfirmDialog>

      <ConfirmDialog open={dialog?.kind === "conflict"} onClose={close} title="Die Klausur wurde inzwischen geändert." text={dialog?.exam ? `Jetzt: »${examLabel(dialog.exam)}«${dialog.exam.topic ? ` · ${dialog.exam.topic}` : ""}` : ""}>
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
// Форма Klausur. exam = null — нова, інакше правка.
// Логіка відповідей сервера — у useExamSave, правила полів — у examRules.js.
// ─────────────────────────────────────────────────────────────
const ExamForm = ({ exam }) => {
  const { today } = useNow();
  const me = usePlanStore((s) => s.me);
  const teacher = isTeacher(me);
  const meta = usePlanStore((s) => s.meta);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const overrides = useUserStore((s) => s.colorOverrides);
  const [fields, setFields] = useState(() => ({ ...examToForm(exam), studentsMayEdit: exam?.studentsMayEdit ?? false }));
  const [localErrors, setLocalErrors] = useState({});
  const flow = useExamSave(exam);

  // Вид запису адмін міг прибрати зі списку: тоді він лишається вибраним, поки його не змінять
  const types = [...new Set([...(meta?.examTypes ?? DEFAULT_TYPES), ...(exam ? [exam.type] : [])])];
  const lessons = meta?.lessonTimes?.map((time) => time.period) ?? DEFAULT_LESSONS;
  const subjects = formSubjects(courses, picked, meta?.subjects, exam?.subject);
  // studentsMayEdit надсилає лише вчитель
  const { studentsMayEdit, ...plain } = fields;
  const form = { ...plain, type: fields.type ?? types[0], topic: fields.topic.trim(), ...(teacher ? { studentsMayEdit } : {}) };
  const errors = { ...localErrors, ...flow.fieldErrors };

  // Поле змінили: його стара помилка вже нічого не означає (і під полем знову видно лічильник)
  const change = (part) => {
    setFields({ ...fields, ...part });
    setLocalErrors(Object.fromEntries(Object.entries(localErrors).filter(([field]) => !(field in part))));
    flow.clearFieldErrors();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateExamForm(form, today, exam?.date);
    setLocalErrors(found);
    if (Object.keys(found).length === 0) flow.save(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col lg:max-w-186">
      <PageHeader
        backTo="/testen"
        eyebrow={formEyebrow(me, "Klausur eintragen")}
        eyebrowClassName="text-accent-ink"
        title={exam ? "Klausur ändern" : "Neue Klausur"}
      />

      <div className="mt-5 flex flex-col gap-5">
        <Field label="Art" error={errors.type}>
          <Segmented label="Art" size="form" value={form.type} options={types.map((type) => ({ value: type, label: type }))} onChange={(type) => change({ type })} />
        </Field>

        <Field label="Fach" error={errors.subject}>
          <div className="flex flex-wrap gap-1.75">
            {subjects.map((subject) => (
              <SubjectToggle key={subject.code} large code={subject.code} label={subject.code} overrides={overrides} selected={fields.subject === subject.code} onClick={() => change({ subject: subject.code })} />
            ))}
          </div>
        </Field>

        <TextField id="exam-date" label="Datum" type="date" value={fields.date} error={errors.date} onChange={(event) => change({ date: event.target.value })} />

        <Field label="Stunde · optional" error={errors.lesson}>
          <div className="flex flex-wrap gap-1.75">
            {lessons.map((lesson) => (
              // повторне натискання знімає урок: він необов'язковий
              <LessonButton key={lesson} lesson={lesson} selected={fields.lesson === lesson} onClick={() => change({ lesson: fields.lesson === lesson ? null : lesson })} />
            ))}
          </div>
        </Field>

        <TextField
          id="exam-topic"
          label="Thema"
          value={fields.topic}
          error={errors.topic}
          hint={`${fields.topic.length} von ${TOPIC_MAX} Zeichen · keine Namen`}
          maxLength={TOPIC_MAX}
          autoComplete="off"
          onChange={(event) => change({ topic: event.target.value })}
        />

        {teacher && <StudentsMayEdit checked={studentsMayEdit} onChange={(value) => change({ studentsMayEdit: value })} note="An: Schüler mit Freigabe dürfen Datum, Stunde und Thema ändern." />}
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <Button variant="primary" type="submit" disabled={flow.busy} className="flex-none">
          <CheckIcon className="size-4" /> Speichern
        </Button>
        {/* учень із Freigabe запис учителя лише міняє, видаляти не може (canDelete) */}
        {exam && exam.canDelete !== false && (
          <Button variant="danger" disabled={flow.busy} className="flex-none" onClick={() => flow.setDialog({ kind: "delete" })}>
            <TrashIcon className="size-4" /> Löschen
          </Button>
        )}
      </div>

      <ExamDialogs flow={flow} exam={exam} form={form} />
    </form>
  );
};

export default ExamForm;
