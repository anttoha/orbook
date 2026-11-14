import { useEffect, useState } from "react";
import * as admin from "../../shared/api/admin";
import { useAdminClasses } from "../../shared/hooks/useAdminClasses";
import { useNow } from "../../shared/hooks/useNow";
import { useAdminStore } from "../../shared/store/adminStore";
import { hasRight, labelError } from "../../shared/utils/admin";
import { codeTarget, targetBody } from "../../shared/utils/adminClasses";
import { cn } from "../../shared/utils/cn";
import Field from "../ui/Field";
import Button from "../ui/Button";
import { CheckIcon, KeyIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import CodeQr from "./CodeQr";
import CodeReveal from "./CodeReveal";
import RightsFields from "./RightsFields";
import SchoolClassField from "./schools/SchoolClassField";
import ValidFields from "./ValidFields";
import ChipButton from "../ui/ChipButton";

// Нові права частини 14 за замовчуванням вимкнені; у Lehrer-Code обидва права одразу ввімкнені (рішення власника)
// Lehrer-Code — одразу з «Materialien teilen» (рішення власника: учителі діляться матеріалами своїх предметів)
// Termine (частина 18): учителю — одразу, Editor-Code — лише якщо адмін увімкне
const START_RIGHTS = {
  editor: { create: true, editOwn: true, editAll: false, homework: false, editTeacher: false, materials: false, appointments: false, manageClass: false },
  teacher: { create: true, homework: true, materials: true, appointments: true, manageClass: false },
};

const chip = "h-9.5 rounded-full border px-4 text-label font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40";

// Kürzel з плану вибраного класу (GET /admin/teachers з його X-ORBook-Class).
// classId = null — клас ще новий, плану вчителів немає. → { status: "loading" | "ready", data }
function useTeachers(classId) {
  const [result, setResult] = useState({ classId: undefined, data: null });
  useEffect(() => {
    if (classId == null) return undefined;
    let cancelled = false;
    admin
      .loadTeachers(classId)
      .then((data) => !cancelled && setResult({ classId, data }))
      .catch(() => !cancelled && setResult({ classId, data: null }));
    return () => {
      cancelled = true;
    };
  }, [classId]);
  if (classId == null) return { status: "ready", data: null };
  return result.classId === classId ? { status: "ready", data: result.data } : { status: "loading", data: null };
}

// «Lehrkraft»: Kürzel з плану класу. У кого вже є код — неактивний.
// Плану ще немає (або клас новий) — поле для Kürzel вручну
const TeacherPicker = ({ classId, value, onChange, disabled, error }) => {
  const teachers = useTeachers(classId);
  const list = teachers.data?.teachers ?? [];
  const taken = list.filter((teacher) => teacher.codeId).map((teacher) => `„${teacher.short}“`);

  if (teachers.status !== "loading" && list.length === 0) {
    return <TextField id="code-teacher" label="Lehrkraft" placeholder="Kürzel, z. B. Mü" error={error} value={value} maxLength={20} readOnly={disabled} onChange={(event) => onChange(event.target.value)} autoComplete="off" />;
  }
  return (
    <Field label="Lehrkraft" error={error}>
      <div className="flex flex-wrap gap-1.75">
        {list.map((teacher) => (
          <ChipButton
            key={teacher.short}
           
            aria-pressed={value === teacher.short}
            disabled={disabled || Boolean(teacher.codeId)}
            onClick={() => onChange(teacher.short)} on={value === teacher.short} look={cn(chip, value === teacher.short ? "border-accent bg-tint text-accent-ink" : "border-rule text-ink")}>
            {teacher.short}
            {/* предмети з плану: «T03 · Ma, Ph» — щоб було видно, хто це (у демо Kürzel вигадані: T01, T02 …) */}
            {teacher.subjects?.length > 0 && <span className="font-normal text-muted"> · {teacher.subjects.join(", ")}</span>}
          </ChipButton>
        ))}
      </div>
      <p className="mt-1.5 text-caption text-faint">Kürzel der Lehrkraft aus dem Plan der Klasse, dahinter ihre Fächer.{taken.length > 0 && ` ${taken.join(", ")} ${taken.length === 1 ? "hat" : "haben"} schon einen Code.`}</p>
    </Field>
  );
};

// Форма: поки код не створено — поля і «Code erzeugen»; після — поля лише для читання, код і «Fertig».
// kind = "teacher" — Lehrer-Code: замість назви — Kürzel, дві галочки
const NewCodeForm = ({ yearEnd, onDone, kind }) => {
  const { today } = useNow();
  const { current } = useAdminClasses();
  const [target, setTarget] = useState(() => codeTarget(current, null)); // для якого класу код (частина 29)
  const teacherCode = kind === "teacher";
  const [label, setLabel] = useState("");
  const [rights, setRights] = useState(START_RIGHTS[kind]);
  const [valid, setValid] = useState({ choice: yearEnd ? "schuljahresende" : "30d", date: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null); // { code, item } з відповіді сервера

  const create = async (event) => {
    event.preventDefault();
    const found = {
      label: teacherCode ? (label.trim() ? null : "Bitte eine Lehrkraft wählen.") : labelError(label),
      rights: hasRight(rights) ? null : "Mindestens ein Recht auswählen.",
      valid: valid.choice === "date" && !(valid.date > today) ? "Bitte ein Datum in der Zukunft wählen." : null,
      target: target && !target.className ? "Bitte eine Klasse wählen." : null,
    };
    setErrors(found);
    if (Object.values(found).some(Boolean) || busy) return;
    setBusy(true);
    try {
      const validValue = valid.choice === "date" ? valid.date : valid.choice;
      const where = targetBody(target, current); // інший або новий клас: schoolId + className
      setCreated(teacherCode ? await admin.createTeacherCode({ teacher: label.trim(), rights, valid: validValue, ...where }) : await admin.createCode({ label: label.trim(), rights, valid: validValue, ...where }));
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setBusy(false);
    }
  };

  const locked = Boolean(created); // після створення нічого не змінюємо
  return (
    <form onSubmit={create} noValidate className="flex flex-col gap-4">
      <SchoolClassField value={target} onChange={setTarget} disabled={locked} error={errors.target} />
      {teacherCode ? (
        <TeacherPicker classId={target ? target.id : (current?.id ?? 0)} value={label} onChange={setLabel} disabled={locked} error={errors.label} />
      ) : (
        <TextField id="code-label" label="Bezeichnung" placeholder="z. B. Code D" error={errors.label} value={label} maxLength={40} readOnly={locked} onChange={(event) => setLabel(event.target.value)} autoComplete="off" />
      )}
      <RightsFields value={rights} onChange={setRights} disabled={locked} error={errors.rights} kind={kind} />
      <ValidFields choice={valid.choice} date={valid.date} yearEnd={yearEnd} onChange={setValid} disabled={locked} error={errors.valid} />
      {errors.form && <p role="alert" className="text-hint text-danger">{errors.form}</p>}
      {created ? (
        <>
          <CodeReveal code={created.code} masked={created.item.masked} title={created.class?.name ? `Neuer Code · Klasse ${created.class.name}` : "Neuer Code"} note="Du siehst ihn später wieder: ⋮ → »Code anzeigen«." />
          {/* часть 25: QR и (у Lehrer-Code) лист для печати */}
          <CodeQr code={created.code} kind={kind} teacher={teacherCode ? label.trim() : null} rights={rights} />
          <Button variant="primary" className="flex-none" onClick={onDone}>
            <CheckIcon className="size-4" /> Fertig
          </Button>
        </>
      ) : (
        <Button type="submit" variant="primary" disabled={busy} className="flex-none">
          <KeyIcon className="size-4" /> {busy ? "Wird erzeugt…" : "Code erzeugen"}
        </Button>
      )}
    </form>
  );
};

// Вікно «Neuer Editor-Code» / «Neuer Lehrer-Code» (ПК — по центру, телефон — шторка знизу).
// Список оновлюємо при закритті: новий код у ньому з'явиться вже замаскованим
const NewCodeSheet = ({ open, onClose, kind = "editor" }) => {
  const yearEnd = useAdminStore((s) => s.settings.data?.settings.school.yearEnd ?? null);
  // Форма запам'ятовує строк один раз — чекаємо налаштувань, щоб за замовчуванням був «Schuljahresende»
  const settingsReady = useAdminStore((s) => s.settings.status !== "loading");
  const reloadCodes = useAdminStore((s) => s.reloadCodes);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);
  const reloadSchools = useAdminStore((s) => s.reloadSchools);

  // Список показує коди всіх класів — новий код буде в ньому, навіть якщо він для іншого класу
  const close = async () => {
    await reloadSchools(); // код міг створити новий клас — спершу він має з'явитися в списку класів
    reloadCodes();
    reloadOverview();
    onClose();
  };

  return (
    <Sheet open={open} onClose={close} desktop="dialog" eyebrow={kind === "teacher" ? "Admin · Lehrer-Codes" : "Admin · Editor-Codes"} title={kind === "teacher" ? "Neuer Lehrer-Code" : "Neuer Editor-Code"}>
      {/* поки вікно закрите, форми немає: кожне відкриття — нова порожня форма */}
      {open && settingsReady && <NewCodeForm yearEnd={yearEnd} onDone={close} kind={kind} />}
    </Sheet>
  );
};

export default NewCodeSheet;
