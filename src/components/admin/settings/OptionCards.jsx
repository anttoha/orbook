import Switch from "../../ui/Switch";
import SelectPill from "../../ui/SelectPill";
import { withCurrent } from "../../../shared/utils/admin";
import OptionRow from "./OptionRow";
import SettingsCard from "./SettingsCard";

// Варіанти списків (межі — як перевіряє сервер, appsettings.py)
const minutes = (values) => values.map((value) => ({ value, label: `${value} min` }));
const POLL = minutes([2, 5, 10, 15, 30, 60]);
const LOCK = minutes([5, 10, 15, 30, 60, 120]);
const KEEP = [
  { value: 90, label: "3 Monate" },
  { value: 180, label: "6 Monate" },
  { value: 365, label: "1 Jahr" },
  { value: 730, label: "2 Jahre" },
  { value: 1825, label: "5 Jahre" },
];
const SESSION = [1, 7, 14, 30, 90, 180, 365].map((value) => ({ value, label: value === 1 ? "1 Tag" : `${value} Tage` }));
const ATTEMPTS = [3, 5, 10, 20].map((value) => ({ value, label: String(value) }));

const divided = "divide-y divide-hair";

// Рядок зі списком; bad — ключі, які сервер не прийняв (422)
const SelectRow = ({ label, hint, section, field, options, form, set, bad }) => (
  <OptionRow label={label} hint={hint} invalid={bad.has(`${section}.${field}`)}>
    <SelectPill label={label} value={form[section][field]} options={withCurrent(options, form[section][field])} onChange={(value) => set(section, field, value)} />
  </OptionRow>
);

// Рядок з перемикачем
const SwitchRow = ({ label, hint, section, field, form, set }) => (
  <OptionRow label={label} hint={hint}>
    <Switch label={label} checked={form[section][field]} onChange={(value) => set(section, field, value)} />
  </OptionRow>
);

// «Aktualisierung»: як часто питати план і скільки зберігати
export const UpdateCard = ({ className, ...props }) => (
  <SettingsCard title="Aktualisierung" className={className}>
    <div className={divided}>
      <SelectRow label="Plan abrufen alle" section="plan" field="pollMinutes" options={POLL} {...props} />
      <SwitchRow label="Nur an Schultagen" hint="Wochenende und Ferien überspringen" section="plan" field="onlySchoolDays" {...props} />
      <SelectRow label="Alte Pläne behalten" hint="für die Statistik" section="plan" field="retentionDays" options={KEEP} {...props} />
    </div>
  </SettingsCard>
);

// «Funktionen»: що бачить клас
export const FeaturesCard = ({ className, ...props }) => (
  <SettingsCard title="Funktionen" className={className}>
    <div className={divided}>
      <SwitchRow label="Statistik zeigen" section="features" field="statistics" {...props} />
      <SwitchRow label="Notizen-Sync erlauben" hint="Zufällige Codes, ohne Namen" section="features" field="notesSync" {...props} />
      <SwitchRow label="Teilen-Knopf" hint="Text für WhatsApp erzeugen" section="features" field="share" {...props} />
      <SwitchRow label="Klausuren ohne Editor-Code" hint="Jeder mit Klassenpasswort darf eintragen" section="features" field="examsWithoutCode" {...props} />
    </div>
  </SettingsCard>
);

// «Sicherheit»: вхід класу
export const SecurityCard = ({ className, ...props }) => (
  <SettingsCard title="Sicherheit" className={className}>
    <div className={divided}>
      <SelectRow label="Anmeldung gültig" hint="danach Passwort neu eingeben" section="security" field="sessionDays" options={SESSION} {...props} />
      <SelectRow label="Fehlversuche bis Sperre" section="security" field="maxFailedAttempts" options={ATTEMPTS} {...props} />
      <SelectRow label="Sperrzeit" section="security" field="lockMinutes" options={LOCK} {...props} />
    </div>
  </SettingsCard>
);

// «Hausaufgaben» (частина 14, макет handy-12): коли видаляти після строку здачі. 0 — у кінці навчального року
const HOMEWORK_KEEP = [
  { value: 7, label: "nach 7 Tagen" },
  { value: 14, label: "nach 14 Tagen" },
  { value: 30, label: "nach 30 Tagen" },
  { value: 90, label: "nach 90 Tagen" },
  { value: 0, label: "zum Schuljahresende" },
];

// «Termine» (частина 18): коли видаляти після останнього дня (рішення власника — налаштовується)
export const AppointmentsCard = ({ className, ...props }) =>
  props.form.appointments ? (
    <SettingsCard title="Termine" className={className}>
      <div className={divided}>
        <SelectRow label="Automatisch löschen" hint="nach dem letzten Tag" section="appointments" field="keepDays" options={HOMEWORK_KEEP} {...props} />
      </div>
    </SettingsCard>
  ) : null;

// Старі сервери не мають розділу homework у settings — тоді картки немає
export const HomeworkCard = ({ className, onPurge, purging, ...props }) =>
  props.form.homework ? (
    <SettingsCard title="Hausaufgaben" className={className}>
      <div className={divided}>
        <SelectRow label="Automatisch löschen" hint="nach dem Abgabetag" section="homework" field="keepDays" options={HOMEWORK_KEEP} {...props} />
        <OptionRow label="Hausaufgaben jetzt aufräumen" hint="Abgelaufene nach dieser Regel löschen">
          <button type="button" disabled={purging} onClick={onPurge} className="h-8.5 rounded-full bg-sand px-3.5 text-hint font-bold text-ink disabled:opacity-50">
            Aufräumen
          </button>
        </OptionRow>
      </div>
    </SettingsCard>
  ) : null;
