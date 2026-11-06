import { useEffect, useState } from "react";
import * as admin from "../../shared/api/admin";
import { useNow } from "../../shared/hooks/useNow";
import { useAdminStore } from "../../shared/store/adminStore";
import { hasRight, labelError } from "../../shared/utils/admin";
import { cn } from "../../shared/utils/cn";
import Field from "../ui/Field";
import Button from "../ui/Button";
import { CheckIcon, KeyIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import CodeReveal from "./CodeReveal";
import RightsFields from "./RightsFields";
import ValidFields from "./ValidFields";

// Нові права частини 14 за замовчуванням вимкнені; у Lehrer-Code обидва права одразу ввімкнені (рішення власника)
const START_RIGHTS = { editor: { create: true, editOwn: true, editAll: false, homework: false, editTeacher: false }, teacher: { create: true, homework: true } };

const chip = "h-9.5 rounded-full border px-4 text-label font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40";

// «Lehrkraft»: Kürzel з плану класу (GET /admin/teachers). У кого вже є код — неактивний.
// Плану ще немає — поле для Kürzel вручну
const TeacherPicker = ({ value, onChange, disabled, error }) => {
  const teachers = useAdminStore((s) => s.teachers);
  const reloadTeachers = useAdminStore((s) => s.reloadTeachers);
  useEffect(() => {
    reloadTeachers();
  }, [reloadTeachers]);
  const list = teachers.data?.teachers ?? [];
  const taken = list.filter((teacher) => teacher.codeId).map((teacher) => `„${teacher.short}“`);

  if (teachers.status !== "loading" && list.length === 0) {
    return <TextField id="code-teacher" label="Lehrkraft" placeholder="Kürzel, z. B. Mü" error={error} value={value} maxLength={20} readOnly={disabled} onChange={(event) => onChange(event.target.value)} autoComplete="off" />;
  }
  return (
    <Field label="Lehrkraft" error={error}>
      <div className="flex flex-wrap gap-1.75">
        {list.map((teacher) => (
          <button
            key={teacher.short}
            type="button"
            aria-pressed={value === teacher.short}
            disabled={disabled || Boolean(teacher.codeId)}
            onClick={() => onChange(teacher.short)}
            className={cn(chip, value === teacher.short ? "border-accent bg-tint text-accent-ink" : "border-rule text-ink")}
          >
            {teacher.short}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-caption text-faint">Kürzel aus dem Plan der Klasse.{taken.length > 0 && ` ${taken.join(", ")} ${taken.length === 1 ? "hat" : "haben"} schon einen Code.`}</p>
    </Field>
  );
};

// Форма: поки код не створено — поля і «Code erzeugen»; після — поля лише для читання, код і «Fertig».
// kind = "teacher" — Lehrer-Code: замість назви — Kürzel, дві галочки
const NewCodeForm = ({ yearEnd, onDone, kind }) => {
  const { today } = useNow();
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
    };
    setErrors(found);
    if (Object.values(found).some(Boolean) || busy) return;
    setBusy(true);
    try {
      const validValue = valid.choice === "date" ? valid.date : valid.choice;
      setCreated(teacherCode ? await admin.createTeacherCode({ teacher: label.trim(), rights, valid: validValue }) : await admin.createCode({ label: label.trim(), rights, valid: validValue }));
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setBusy(false);
    }
  };

  const locked = Boolean(created); // після створення нічого не змінюємо
  return (
    <form onSubmit={create} noValidate className="flex flex-col gap-4">
      {teacherCode ? (
        <TeacherPicker value={label} onChange={setLabel} disabled={locked} error={errors.label} />
      ) : (
        <TextField id="code-label" label="Bezeichnung" placeholder="z. B. Code D" hint="Nur für dich sichtbar" error={errors.label} value={label} maxLength={40} readOnly={locked} onChange={(event) => setLabel(event.target.value)} autoComplete="off" />
      )}
      <RightsFields value={rights} onChange={setRights} disabled={locked} error={errors.rights} kind={kind} />
      <ValidFields choice={valid.choice} date={valid.date} yearEnd={yearEnd} onChange={setValid} disabled={locked} error={errors.valid} />
      {errors.form && <p role="alert" className="text-hint text-danger">{errors.form}</p>}
      {created ? (
        <>
          <CodeReveal code={created.code} masked={created.item.masked} />
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

  const close = () => {
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
