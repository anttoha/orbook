import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import * as admin from "../../../shared/api/admin";
import { useAdminStore } from "../../../shared/store/adminStore";
import { canReset, newTeacherBody, teacherErrors, teacherForm, teacherPatch, teacherTitle } from "../../../shared/utils/teachers";
import { translate } from "../../../shared/i18n/translate";
import { useT } from "../../../shared/hooks/useT";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import { CheckIcon, KeyIcon, RenewIcon } from "../../ui/icons";
import Sheet from "../../ui/Sheet";
import TextField from "../../ui/TextField";
import SubjectPicker from "./SubjectPicker";

// «Neue Lehrkraft» / Lehrkraft bearbeiten (Entwurf 34): Name (freiwillig), Kürzel, Fächer.
// teacher = null — neu. Das Kürzel einer Lehrkraft aus dem Plan ist gesperrt (der Plan kennt nur das Kürzel)
const TeacherFormSheet = ({ teacher, classSubjects, onClose }) => {
  const t = useT();
  const reloadTeachers = useAdminStore((s) => s.reloadTeachers);
  const [form, setForm] = useState(() => teacherForm(teacher));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const locked = teacher && teacher.source !== "eigen";
  const set = (field) => (value) => setForm((old) => ({ ...old, [field]: value }));

  // Rückfrage vor dem Senden: Kürzel und mindestens ein Fach
  const check = () => ({
    ...(form.short.trim() ? {} : { short: t("Bitte ein Kürzel eintragen.") }),
    ...(form.subjects.length ? {} : { subjects: t("Bitte mindestens ein Fach wählen.") }),
  });

  const run = async (request, message) => {
    setBusy(true);
    try {
      await request();
      await reloadTeachers();
      toast.success(message);
      onClose();
    } catch (error) {
      const found = teacherErrors(error);
      if (found.message) toast.error(found.message);
      else setErrors(found);
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    const problems = check();
    setErrors(problems);
    if (Object.keys(problems).length) return;
    if (!teacher) return run(() => admin.createTeacher(newTeacherBody(form)), translate("„{name}“ hinzugefügt", { name: form.name.trim() || form.short.trim() }));
    const patch = teacherPatch(teacher, form);
    if (!Object.keys(patch).length) return onClose();
    return run(() => admin.updateTeacher(teacher.short, patch), translate("„{name}“ gespeichert", { name: form.name.trim() || teacher.short }));
  };

  const reset = () => run(() => admin.deleteTeacher(teacher.short), translate("„{name}“ zurückgesetzt", { name: teacherTitle(teacher) }));

  return (
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={t("Admin · Lehrkräfte")} title={teacher ? teacherTitle(teacher) : t("Neue Lehrkraft")}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <TextField id="teacher-name" label={t("Name")} value={form.name} maxLength={60} error={errors.name} autoComplete="off" onChange={(event) => set("name")(event.target.value)} />
        <TextField id="teacher-short" label={t("Kürzel")} value={form.short} maxLength={20} error={errors.short} readOnly={locked} autoComplete="off" onChange={(event) => set("short")(event.target.value)} />
        <Field label={t("Fächer")} error={errors.subjects}>
          <SubjectPicker classSubjects={classSubjects} selected={form.subjects} onChange={set("subjects")} />
        </Field>
        {teacher && (
          <Link to="/admin/lehrer" onClick={onClose} className="flex h-12.5 items-center gap-3.25 rounded-card bg-card px-3.5 text-row text-ink">
            <KeyIcon className="size-4.5 text-muted" /> {t("Lehrer-Code")}
          </Link>
        )}
        <div className="flex flex-wrap gap-2">
          {teacher && canReset(teacher) && (
            <Button type="button" disabled={busy} onClick={reset}>
              <RenewIcon className="size-4" /> {t("Auf Plan zurücksetzen")}
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={busy}>
            <CheckIcon className="size-4" /> {teacher ? t("Speichern") : t("Hinzufügen")}
          </Button>
        </div>
      </form>
    </Sheet>
  );
};

export default TeacherFormSheet;
