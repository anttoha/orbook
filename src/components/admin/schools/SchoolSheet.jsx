import { useState } from "react";
import { toast } from "sonner";
import * as admin from "../../../shared/api/admin";
import { useAdminStore } from "../../../shared/store/adminStore";
import { cn } from "../../../shared/utils/cn";
import Button from "../../ui/Button";
import { CheckIcon, RenewIcon, TrashIcon } from "../../ui/icons";
import PasswordField from "../../ui/PasswordField";
import Sheet from "../../ui/Sheet";
import TextField from "../../ui/TextField";
import { TestResult } from "../settings/SchoolCard";

const DEFAULT_SERVER = "https://www.stundenplan24.de";

// Ошибки полей с сервера (422 details.fields) → тексты под полями
const FIELD_TEXT = { name: "Bitte einen Namen eingeben.", number: "Nur Ziffern (4 bis 12).", password: "Bitte das Passwort der Schule eingeben.", baseUrl: "Nur https://, ohne Pfad, keine lokalen Adressen." };
function fieldErrors(error) {
  const fields = error?.details?.fields ?? [];
  return Object.fromEntries(fields.map((item) => [item.field, FIELD_TEXT[item.field] ?? error.message]));
}

// Что ввели → тело запроса. У сохранённой школы пустой пароль = «не менять»
const bodyOf = (form) => ({ name: form.name.trim(), number: form.number.trim(), baseUrl: form.baseUrl.trim() || DEFAULT_SERVER, ...(form.password ? { password: form.password } : {}) });

// «Verbindung testen» → плашка «Verbindung steht · 24 Klassen im Plan» или текст ошибки
const testText = (answer) => (answer.ok ? { ok: true, text: `Verbindung steht · ${answer.classesFound} Klassen im Plan` } : { ok: false, text: answer.message || "Verbindung fehlgeschlagen" });

// Форма школы. school = null — новая школа
const SchoolForm = ({ school, onDone }) => {
  const reloadSchools = useAdminStore((s) => s.reloadSchools);
  const [form, setForm] = useState({ name: school?.name ?? "", number: school?.number ?? "", password: "", baseUrl: school?.baseUrl ?? DEFAULT_SERVER });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(null); // "test" | "save" | "delete"
  const set = (field) => (event) => setForm((old) => ({ ...old, [field]: event.target.value }));

  // Проверить, не сохраняя. Новую школу без пароля проверить нельзя
  const test = async () => {
    if (!school && !form.password) return setErrors({ password: FIELD_TEXT.password });
    setBusy("test");
    setResult(null);
    try {
      const { number, password, baseUrl } = bodyOf(form); // имя для проверки не нужно
      setResult(testText(await admin.testSchool(school?.id, { number, password, baseUrl })));
    } catch (error) {
      setResult({ ok: false, text: error.message });
    } finally {
      setBusy(null);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    if (!school && !form.password) return setErrors({ password: FIELD_TEXT.password });
    setBusy("save");
    setErrors({});
    try {
      const saved = school ? await admin.updateSchool(school.id, bodyOf(form)) : await admin.createSchool(bodyOf(form));
      // Сохранённая школа: проверка заодно запоминает список классов (нужен полю «Klasse» у кодов)
      await admin.testSchool(saved?.id ?? school?.id).catch(() => null);
      await reloadSchools();
      toast.success(school ? "Schule gespeichert" : `${form.name.trim()} hinzugefügt`);
      onDone();
    } catch (error) {
      const found = fieldErrors(error);
      setErrors(Object.keys(found).length ? found : { form: error.message });
    } finally {
      setBusy(null);
    }
  };

  // Только пустая школа (без классов) и не первая
  const canDelete = school && school.id !== 1 && (school.classes ?? []).length === 0;
  const remove = async () => {
    setBusy("delete");
    try {
      await admin.deleteSchool(school.id);
      await reloadSchools();
      toast.success("Schule entfernt");
      onDone();
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-4">
      <TextField id="school-name" label="Name der Schule" placeholder="z. B. Schiller-Schule" maxLength={80} autoComplete="off" error={errors.name} value={form.name} onChange={set("name")} />
      <div className="grid grid-cols-2 gap-3">
        <TextField id="school-nr" label="Schulnummer" inputMode="numeric" autoComplete="off" maxLength={20} error={errors.number} value={form.number} onChange={set("number")} />
        <PasswordField id="school-pass" label="Passwort der Schule" autoComplete="new-password" placeholder={school?.passwordSet ? "unverändert" : ""} error={errors.password} value={form.password} onChange={set("password")} />
      </div>
      <TextField id="school-url" label="Server" inputMode="url" autoComplete="off" error={errors.baseUrl} hint="Schulnummer und Passwort gibt die Schule aus." value={form.baseUrl} onChange={set("baseUrl")} />
      {result && <TestResult result={result} />}
      {errors.form && <p role="alert" className="text-hint text-danger">{errors.form}</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <Button className="flex-none" disabled={busy !== null} onClick={test}>
          <RenewIcon className={cn("size-4", busy === "test" && "animate-spin")} /> Verbindung testen
        </Button>
        <Button type="submit" variant="primary" className="flex-none" disabled={busy !== null}>
          <CheckIcon className="size-4" /> {busy === "save" ? "Wird gespeichert…" : "Speichern"}
        </Button>
      </div>
      {canDelete && (
        <button type="button" disabled={busy !== null} onClick={remove} className="flex h-11 items-center justify-center gap-2 text-label font-extrabold text-danger disabled:opacity-50">
          <TrashIcon className="size-4" /> Schule entfernen
        </button>
      )}
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// «Schule hinzufügen» / «Zugang ändern» (часть 29, макеты handy-13, pc-04): как карточка «Schule & Plan» —
// имя, Schulnummer, Passwort der Schule, Server; «Verbindung testen» проверяет, ничего не сохраняя.
// school = null — новая школа
// ─────────────────────────────────────────────────────────────
const SchoolSheet = ({ open, school, onClose }) => (
  <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow="Schulen & Klassen" title={school ? school.name : "Schule hinzufügen"}>
    {open && <SchoolForm key={school?.id ?? "neu"} school={school} onDone={onClose} />}
  </Sheet>
);

export default SchoolSheet;
