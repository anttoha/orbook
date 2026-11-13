import { useState } from "react";
import { loadClasses, testConnection } from "../../../shared/api/admin";
import { useAdminLoad } from "../../../shared/hooks/useAdminLoad";
import { berlinClock, withCurrent } from "../../../shared/utils/admin";
import { cn } from "../../../shared/utils/cn";
import { CheckIcon, RenewIcon, WarningIcon } from "../../ui/icons";
import SelectPill from "../../ui/SelectPill";
import TextField from "../../ui/TextField";
import OptionRow from "./OptionRow";
import SettingsCard from "./SettingsCard";

// Результат «Verbindung testen»: зелена або червона плашка
export const TestResult = ({ result }) => (
  <p className={cn("flex min-h-10.5 items-center gap-2 rounded-full px-3.5 text-label", result.ok ? "bg-ok-tint text-ok" : "bg-danger-tint text-danger")}>
    {result.ok ? <CheckIcon className="size-4 shrink-0" /> : <WarningIcon className="size-4 shrink-0" />}
    <span>{result.text}</span>
  </p>
);

// Текст відповіді test-connection
function resultText(answer) {
  if (!answer.ok) return { ok: false, text: answer.message || "Verbindung fehlgeschlagen" };
  if (answer.classFound === false) return { ok: false, text: `Klasse nicht gefunden · ${answer.classesFound} Klassen gefunden` };
  return { ok: true, text: `Verbindung ok · ${answer.classesFound} Klassen gefunden · ${berlinClock()}` };
}

// ─────────────────────────────────────────────────────────────
// «Schule & Plan»: номер школи, пароль школи (лише запис), сервер, клас, «Verbindung testen».
// Демо-сервер не дає міняти доступ до школи (403 demo_mode) — поля вимкнені.
// school — form.school; onChange(key, value); bad — ключі, які сервер не прийняв
// ─────────────────────────────────────────────────────────────
const SchoolCard = ({ school, onChange, schoolPassword, onSchoolPassword, passwordSet, demo, bad, className }) => {
  const classes = useAdminLoad("classes", loadClasses);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const classOptions = withCurrent((classes.data?.classes ?? []).map((name) => ({ value: name, label: name })), school.className);
  const demoHint = demo ? "Im Demo-Betrieb gibt es keinen Schulzugang." : null;

  const test = async () => {
    setTesting(true);
    setResult(null);
    try {
      const body = { number: school.number || undefined, baseUrl: school.baseUrl, className: school.className, ...(schoolPassword ? { password: schoolPassword } : {}) };
      setResult(resultText(await testConnection(body)));
    } catch (error) {
      setResult({ ok: false, text: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <SettingsCard title="Schule & Plan" plain className={className}>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-5">
        <TextField id="school-number" label="Schulnummer" inputMode="numeric" autoComplete="off" disabled={demo} hint={demoHint} error={bad.has("school.number") ? "Nur Ziffern (4 bis 12)." : null} value={school.number ?? ""} onChange={(event) => onChange("number", event.target.value || null)} />
        <TextField id="school-password" label="Passwort der Schule" type="password" autoComplete="new-password" disabled={demo} placeholder={passwordSet ? "••••••" : "Passwort"} hint={passwordSet ? "Gespeichert · leer lassen = unverändert" : null} value={schoolPassword} onChange={(event) => onSchoolPassword(event.target.value)} />
        <TextField id="school-server" className="lg:col-span-2" label="Server" inputMode="url" autoComplete="off" disabled={demo} error={bad.has("school.baseUrl") ? "Nur https://, ohne Pfad, keine lokalen Adressen." : null} value={school.baseUrl} onChange={(event) => onChange("baseUrl", event.target.value)} />
      </div>
      <OptionRow label="Klasse" invalid={bad.has("school.className")}>
        <SelectPill label="Klasse" value={school.className} options={classOptions} onChange={(value) => onChange("className", value)} />
      </OptionRow>
      <div className="flex flex-col gap-2.5 pb-3 lg:flex-row lg:items-center">
        <button type="button" disabled={testing} onClick={test} className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-sand px-5 text-row font-extrabold text-ink disabled:opacity-50">
          <RenewIcon className={cn("size-4", testing && "animate-spin")} /> Verbindung testen
        </button>
        {result && <TestResult result={result} />}
      </div>
    </SettingsCard>
  );
};

export default SchoolCard;
