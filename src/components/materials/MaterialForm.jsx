import { Info, Link2, Lock } from "lucide-react";
import { useState } from "react";
import { useExamSave } from "../../shared/hooks/useExamSave";
import { deleteMaterial, recreateMaterial, saveMaterial } from "../../shared/api/materials";
import { useMaterials } from "../../shared/store/materialsStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { formEyebrow, formSubjects, isTeacher } from "../../shared/utils/examRules";
import { TITLE_MAX, materialSubjects, materialToForm, validateMaterialForm } from "../../shared/utils/materials";
import ListPicker from "../ui/ListPicker";
import { subjectItems } from "../../shared/utils/picker";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import Field from "../ui/Field";
import { CheckIcon, TrashIcon } from "../ui/icons";
import PageHeader from "../ui/PageHeader";
import TextField from "../ui/TextField";
import DeleteMaterialDialog from "./DeleteMaterialDialog";
import LinkStatus from "./LinkStatus";

// Як зберігати посилання — для спільного useExamSave (той самий шлях, що в Klausuren і Hausaufgaben):
// If-Match, 409 «вже змінили», «Rückgängig». Список живе в materialsStore, а не в planStore
const MATERIAL_OPS = {
  noun: "Link",
  listPath: "/materialien",
  savedText: "Gespeichert · die Klasse sieht den Link",
  save: saveMaterial,
  remove: deleteMaterial,
  restore: recreateMaterial,
  toForm: materialToForm,
  onChanged: (saved) => (saved ? useMaterials.getState().saved(saved) : useMaterials.getState().load()),
};

// Сіра підказка з іконкою (як у формі Hausaufgabe)
const Note = ({ icon: Icon, children }) => (
  <div className="flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted">
    <Icon className="mt-0.5 size-4 shrink-0" />
    <p>{children}</p>
  </div>
);

// Предмет — одне поле зі списком і пошуком (design/neu/19c)
const SubjectChoice = ({ subjects, courses, value, error, teacher, onChange }) => {
  const hint = teacher ? (subjects.length > 0 ? "Nur Ihre Fächer laut Plan." : "Für Ihre Fächer gibt es im Plan keine Kurse.") : null;
  return (
    <Field label="Fach" error={error}>
      <ListPicker id="material-subject" label="Fach" items={subjectItems(subjects, [], courses)} value={value} error={Boolean(error)} onChange={onChange} />
      {hint && <p className="mt-2 text-caption text-faint">{hint}</p>}
    </Field>
  );
};

// ─────────────────────────────────────────────────────────────
// Форма посилання (макети handy-03/04, pc-03/04). item = null — нове, інакше правка.
// Посилання перевіряємо одразу (checkLink), остаточно — сервер.
// ─────────────────────────────────────────────────────────────
const MaterialForm = ({ item }) => {
  const me = usePlanStore((s) => s.me);
  const meta = usePlanStore((s) => s.meta);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const teacher = isTeacher(me);
  const subjects = materialSubjects(me, formSubjects(courses, picked, meta?.subjects, item?.subject));
  // одного предмета досить, щоб не натискати зайвий раз
  const [fields, setFields] = useState(() => (item ? materialToForm(item) : { ...materialToForm(null), subject: subjects.length === 1 ? subjects[0].code : null }));
  const [localErrors, setLocalErrors] = useState({});
  const flow = useExamSave(item, MATERIAL_OPS);
  const errors = { ...localErrors, ...flow.fieldErrors };

  const change = (part) => {
    setFields({ ...fields, ...part });
    setLocalErrors(Object.fromEntries(Object.entries(localErrors).filter(([field]) => !(field in part))));
    flow.clearFieldErrors();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = { ...fields, title: fields.title.trim(), url: fields.url.trim() };
    const found = validateMaterialForm(form);
    setLocalErrors(found);
    if (Object.keys(found).length === 0) flow.save(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col lg:max-w-186">
      <PageHeader backTo="/materialien" eyebrow={formEyebrow(me, "Materialien")} eyebrowClassName="text-accent-ink" title={item ? "Link ändern" : "Neuer Link"} />

      <div className="mt-5 flex flex-col gap-5">
        <SubjectChoice subjects={subjects} courses={courses} value={fields.subject} error={errors.subject} teacher={teacher} onChange={(subject) => change({ subject })} />

        <div>
          <TextField id="material-url" label="Link" type="url" inputMode="url" autoComplete="off" placeholder="Link einfügen" value={fields.url} error={errors.url} leading={<Link2 className="size-4.5" />} onChange={(event) => change({ url: event.target.value })} />
          <LinkStatus url={fields.url} hasError={Boolean(errors.url)} />
        </div>

        <TextField
          id="material-title"
          label="Titel"
          placeholder="z. B. Arbeitsblätter Analysis"
          value={fields.title}
          error={errors.title}
          hint={fields.title ? `${fields.title.length} von ${TITLE_MAX} Zeichen` : "So steht es in der Liste."}
          maxLength={TITLE_MAX}
          onChange={(event) => change({ title: event.target.value })}
        />

        <Note icon={Info}>In Drive „Jeder mit dem Link“ wählen, sonst kommt nur „Zugriff anfordern“.</Note>
        <Note icon={Lock}>{teacher ? `Keine Dateien mit Namen oder Noten von Schülern. Die Klasse sieht „von ${me.teacher.short}“.` : "Keine Dateien mit Namen oder Noten von Schülern."}</Note>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <Button variant="primary" type="submit" disabled={flow.busy || subjects.length === 0} className="flex-none">
          <CheckIcon className="size-4" /> Speichern
        </Button>
        {item?.canDelete && (
          <Button variant="danger" disabled={flow.busy} className="flex-none" onClick={() => flow.setDialog({ kind: "delete" })}>
            <TrashIcon className="size-4" /> Löschen
          </Button>
        )}
      </div>

      {item && <DeleteMaterialDialog item={item} actions={{ confirm: flow.dialog?.kind === "delete", closeConfirm: () => flow.setDialog(null), remove: flow.remove, busy: flow.busy }} />}
      <ConfirmDialog open={flow.dialog?.kind === "conflict"} onClose={() => flow.setDialog(null)} title="Der Link wurde inzwischen geändert." text={flow.dialog?.exam ? `Jetzt: »${flow.dialog.exam.title}«` : ""}>
        <Button variant="primary" className="flex-none basis-full" onClick={() => flow.overwrite({ ...fields, title: fields.title.trim(), url: fields.url.trim() })}>
          Meine Änderung trotzdem speichern
        </Button>
        <Button className="flex-none basis-full" onClick={flow.discard}>
          Verwerfen
        </Button>
      </ConfirmDialog>
    </form>
  );
};

export default MaterialForm;
