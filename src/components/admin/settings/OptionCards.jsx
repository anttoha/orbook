import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Switch from "../../ui/Switch";
import SelectPill from "../../ui/SelectPill";
import { withCurrent } from "../../../shared/utils/admin";
import OptionRow from "./OptionRow";
import WeekLetter from "../../muster/WeekLetter";
import { abLetter } from "../../../shared/utils/muster";
import SettingsCard from "./SettingsCard";
import PillButton from "../../ui/PillButton";
import { useT } from "../../../shared/hooks/useT";
import { translate } from "../../../shared/i18n/translate";

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
// Часть 26: как часто 06–16 Uhr смотреть два ближайших дня (чаще минуты нельзя — не грузим сервер школы)
const FAST = [
  { value: 60, label: "jede Minute" },
  { value: 120, get label() { return translate("alle 2 min"); } },
  { value: 300, get label() { return translate("alle 5 min"); } },
  { value: 0, get label() { return translate("Aus"); } },
];
// Часть 26: сколько дней хранить прошлые Fassungen («Verlauf des Tages»)
const VERSIONS = [7, 14, 30, 90].map((value) => ({ value, get label() { return translate("{value} Tage", { value }); } }));
const SESSION = [1, 7, 14, 30, 90, 180, 365].map((value) => ({ value, get label() { return value === 1 ? translate("1 Tag") : translate("{value} Tage", { value }); } }));
const ATTEMPTS = [3, 5, 10, 20].map((value) => ({ value, label: String(value) }));
// Часть 17: когда приходит «Für morgen» (сервер принимает 14:00–21:59)
const REMINDER = ["16:00", "17:00", "18:00", "19:00", "20:00"].map((value) => ({ value, label: value }));

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
export const UpdateCard = ({ className, ...props }) => {
  const t = useT();
  return (
  <SettingsCard title={t("Aktualisierung")} className={className}>
    <div className={divided}>
      <SelectRow label={t("Plan abrufen alle")} section="plan" field="pollMinutes" options={POLL} {...props} />
      {/* часть 26: старые серверы этих полей не знают — тогда строк нет */}
      {props.form.plan.fastSeconds !== undefined && (
        <SelectRow label={t("Heute und morgen prüfen")} hint={t("06–16 Uhr an Schultagen · neuer Plan prüft sofort die ganze Woche")} section="plan" field="fastSeconds" options={FAST} {...props} />
      )}
      {props.form.plan.live !== undefined && <SwitchRow label={t("Live-Aktualisierung")} hint={t("Neuer Plan erscheint in offenen Apps von selbst")} section="plan" field="live" {...props} />}
      <SwitchRow label={t("Nur an Schultagen")} hint={t("Wochenende und Ferien überspringen")} section="plan" field="onlySchoolDays" {...props} />
      <SelectRow label={t("Alte Pläne behalten")} hint={t("für die Statistik")} section="plan" field="retentionDays" options={KEEP} {...props} />
      {props.form.plan.versionsDays !== undefined && (
        <SelectRow label={t("Verlauf des Tages behalten")} hint={t("frühere Fassungen eines Tages")} section="plan" field="versionsDays" options={VERSIONS} {...props} />
      )}
    </div>
  </SettingsCard>
);
};

// «Mitteilungen» (часть 17): включить для класса и когда напоминать. Число устройств — PushStats ниже
export const PushCard = ({ className, children, ...props }) =>
  {
  const t = useT();
  return props.form.push ? (
    <SettingsCard title={t("Mitteilungen")} className={className}>
      <div className={divided}>
        <SwitchRow label={t("Mitteilungen erlauben")} hint={t("Jeder kann sie unter „Mehr“ für sich einschalten")} section="features" field="push" {...props} />
        <SelectRow label={t("Erinnerung für morgen")} hint={t("Tests und Hausaufgaben am Vortag")} section="push" field="reminderTime" options={REMINDER} {...props} />
      </div>
      {children}
    </SettingsCard>
  ) : null;
};

// «Funktionen»: що бачить клас
export const FeaturesCard = ({ className, ...props }) => {
  const t = useT();
  return (
  <SettingsCard title={t("Funktionen")} className={className}>
    <div className={divided}>
      <SwitchRow label={t("Statistik zeigen")} section="features" field="statistics" {...props} />
      <SwitchRow label={t("Sync erlauben")} hint={t("Notizen, Aufgaben, Einstellungen")} section="features" field="notesSync" {...props} />
      <SwitchRow label={t("Teilen-Knopf")} hint={t("Text für WhatsApp erzeugen")} section="features" field="share" {...props} />
      <SwitchRow label={t("Tests ohne Editor-Code")} hint={t("Jeder mit Klassenpasswort darf eintragen")} section="features" field="examsWithoutCode" {...props} />
      <SwitchRow label={t("Noten")} hint={t("Aus Home.InfoPoint der Schule")} section="features" field="noten" {...props} />
    </div>
  </SettingsCard>
);
};

// «Sicherheit»: вхід класу
export const SecurityCard = ({ className, ...props }) => {
  const t = useT();
  return (
  <SettingsCard title={t("Sicherheit")} className={className}>
    <div className={divided}>
      <SelectRow label={t("Anmeldung gültig")} hint={t("danach Passwort neu eingeben")} section="security" field="sessionDays" options={SESSION} {...props} />
      <SelectRow label={t("Fehlversuche bis Sperre")} section="security" field="maxFailedAttempts" options={ATTEMPTS} {...props} />
      <SelectRow label={t("Sperrzeit")} section="security" field="lockMinutes" options={LOCK} {...props} />
    </div>
  </SettingsCard>
);
};

// «Hausaufgaben» (частина 14, макет handy-12): коли видаляти після строку здачі. 0 — у кінці навчального року
const HOMEWORK_KEEP = [
  { value: 7, get label() { return translate("nach 7 Tagen"); } },
  { value: 14, get label() { return translate("nach 14 Tagen"); } },
  { value: 30, get label() { return translate("nach 30 Tagen"); } },
  { value: 90, get label() { return translate("nach 90 Tagen"); } },
  { value: 0, label: "zum Schuljahresende" },
];

// «Termine» (частина 18): коли видаляти після останнього дня (рішення власника — налаштовується)
export const AppointmentsCard = ({ className, ...props }) =>
  {
  const t = useT();
  return props.form.appointments ? (
    <SettingsCard title={t("Termine")} className={className}>
      <div className={divided}>
        <SelectRow label={t("Automatisch löschen")} hint={t("nach dem letzten Tag")} section="appointments" field="keepDays" options={HOMEWORK_KEEP} {...props} />
      </div>
    </SettingsCard>
  ) : null;
};

// «Muster-Stundenplan» (частина 19, макет 19 handy-11): до якого дня показувати Muster у днях без плану
const MUSTER_UNTIL = [
  { value: "2w", get label() { return translate("2 Wochen"); } },
  { value: "4w", get label() { return translate("4 Wochen"); } },
  { value: "8w", get label() { return translate("8 Wochen"); } },
  { value: "yearEnd", label: "Schuljahresende" },
  { value: "off", get label() { return translate("Aus"); } },
];

// Звідки Muster і як рахуються тижні — з ЗБЕРЕЖЕНИХ налаштувань (міняються на сторінці «Muster», частина 19b)
const MUSTER_SOURCE = { get auto() { return translate("Automatisch · aus den Plänen"); }, get admin() { return translate("Vom Admin · Woche A und B"); } };
const AB_MODE = { get school() { return translate("aus dem Plan der Schule"); }, swap: "getauscht" };

// Рядок-посилання на сторінку «Muster»: назва, підказка, праворуч бейдж і стрілка
const LinkRow = ({ to, label, hint, children }) => (
  <Link to={to} className="-mx-2 flex min-h-16.75 items-center gap-3 rounded-field px-2 py-2.5 hover:bg-paper">
    <span className="min-w-0 flex-1">
      <span className="block text-row text-ink">{label}</span>
      <span className="mt-0.5 block text-caption text-faint">{hint}</span>
    </span>
    {children}
    <ChevronRight className="size-4 shrink-0 text-faint2" />
  </Link>
);

export const MusterCard = ({ className, abWeek, saved, ...props }) => {
  const t = useT();
  if (!props.form.muster) return null;
  const letter = saved?.abMode === "none" ? null : abLetter(abWeek);
  const mode = saved?.abMode ?? "school";
  // Букву знаємо, лише якщо цей браузер увійшов і в клас (meta.abWeek)
  const abHint = mode === "none" ? translate("Jede Woche gleich") : letter ? translate("Diese Woche ist {letter} · {v2}", { letter, v2: AB_MODE[mode] }) : mode === "swap" ? translate("A und B getauscht") : translate("Kommt aus dem Plan der Schule");
  return (
    <SettingsCard title={t("Muster-Stundenplan")} className={className}>
      <div className={divided}>
        <SelectRow label={t("Muster zeigen bis")} hint={t("für Tage ohne echten Plan, nicht in Ferien")} section="muster" field="until" options={MUSTER_UNTIL} {...props} />
        <LinkRow to="/admin/muster" label={t("Muster bearbeiten")} hint={MUSTER_SOURCE[saved?.source ?? "auto"]} />
        <LinkRow to="/admin/muster" label={t("Wochen A und B")} hint={abHint}>
          <WeekLetter letter={letter} />
        </LinkRow>
      </div>
    </SettingsCard>
  );
};

// Старі сервери не мають розділу homework у settings — тоді картки немає
export const HomeworkCard = ({ className, onPurge, purging, ...props }) =>
  {
  const t = useT();
  return props.form.homework ? (
    <SettingsCard title={t("Hausaufgaben")} className={className}>
      <div className={divided}>
        <SelectRow label={t("Automatisch löschen")} hint={t("nach dem Abgabetag")} section="homework" field="keepDays" options={HOMEWORK_KEEP} {...props} />
        <OptionRow label={t("Hausaufgaben jetzt aufräumen")} hint={t("Abgelaufene nach dieser Regel löschen")}>
          <PillButton glass="glass" size="sm" disabled={purging} onClick={onPurge} className="h-8.5 rounded-full bg-sand px-3.5 text-hint font-bold text-ink disabled:opacity-50">
            {t("Aufräumen")}
          </PillButton>
        </OptionRow>
      </div>
    </SettingsCard>
  ) : null;
};
