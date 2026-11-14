import { useState } from "react";
import { useAccessScope } from "../../../shared/hooks/useAccessScope";
import { useAdminClasses } from "../../../shared/hooks/useAdminClasses";
import { useNow } from "../../../shared/hooks/useNow";
import { useAdminStore } from "../../../shared/store/adminStore";
import { AUDIENCES, accessValidChoices, accessValidUntil, accessValidValue, audienceHint, customDevicesError, defaultDevices, devicesFromChoice } from "../../../shared/utils/accessCodes";
import { labelError } from "../../../shared/utils/admin";
import { codeTarget, targetBody } from "../../../shared/utils/adminClasses";
import { copyText } from "../../../shared/utils/share";
import { longDate } from "../../../shared/utils/format";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
import { CheckIcon, CopyIcon, KeyIcon } from "../../ui/icons";
import Segmented from "../../ui/Segmented";
import Sheet from "../../ui/Sheet";
import TextField from "../../ui/TextField";
import CodeReveal from "../CodeReveal";
import SchoolClassField from "../schools/SchoolClassField";
import DevicesField from "./DevicesField";

// Поле-перемикач з підписом і сірою підказкою під ним (Für wen, Geräte, Gültig bis)
const Choice = ({ label, hint, options, value, onChange, disabled }) => (
  <Field label={label}>
    <Segmented label={label} size="form" options={options} value={value} onChange={(next) => !disabled && onChange(next)} />
    <p className="mt-1.5 text-caption text-faint">{hint}</p>
  </Field>
);

const REVEAL_NOTE = () => "Gib ihn nur an die Person oder Gruppe weiter, für die er ist. Du siehst ihn später wieder: ⋮ → »Code anzeigen«.";

// Форма: поки код не створено — поля і «Code erstellen»; після — поля лише для читання, код, «Kopieren», «Fertig»
const NewAccessForm = ({ yearEnd, schoolId, onDone }) => {
  const { today } = useNow();
  const { current } = useAdminClasses(); // в «Klasse verwalten» классов админки нет — полей «Schule/Klasse» тоже
  const { api } = useAccessScope();
  const [label, setLabel] = useState("");
  const [audience, setAudience] = useState("person");
  const [devices, setDevices] = useState({ choice: defaultDevices("person"), custom: "" });
  const [valid, setValid] = useState(yearEnd ? "schuljahresende" : "halbjahr");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null); // { code, item } — повний код лише тут
  const [target, setTarget] = useState(() => codeTarget(current, schoolId)); // для якого класу код (частина 29)

  // Змінили «Für wen» — пропонуємо типовий ліміт (людина — 2, група — 30)
  const chooseAudience = (next) => {
    setAudience(next);
    setDevices((old) => (old.choice === "custom" ? old : { ...old, choice: defaultDevices(next) })); // своє число не чіпаємо
  };

  const create = async (event) => {
    event.preventDefault();
    const found = { label: labelError(label), devices: customDevicesError(devices.choice, devices.custom), target: target && !target.className ? "Bitte eine Klasse wählen." : null };
    setErrors(found);
    if (found.label || found.devices || found.target || busy) return;
    setBusy(true);
    try {
      const body = { label: label.trim(), audience, maxDevices: devicesFromChoice(devices.choice, devices.custom), valid: accessValidValue(valid, today, yearEnd), ...targetBody(target, current) };
      setCreated(await api.create(body));
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setBusy(false);
    }
  };

  const locked = Boolean(created);
  const until = accessValidUntil(valid, today, yearEnd);
  return (
    <form onSubmit={create} noValidate className="flex flex-col gap-4">
      <TextField id="access-label" label="Bezeichnung" placeholder="z. B. Schüler 08" error={errors.label} value={label} maxLength={40} readOnly={locked} onChange={(event) => setLabel(event.target.value)} autoComplete="off" />
      <SchoolClassField value={target} onChange={setTarget} disabled={locked} error={errors.target} />
      <Choice label="Für wen?" hint={audienceHint(audience)} options={AUDIENCES} value={audience} onChange={chooseAudience} disabled={locked} />
      <DevicesField value={devices} onChange={setDevices} hint="Handy + Laptop = 2. Voll? Dann kommt kein neues Gerät rein." error={errors.devices} disabled={locked} />
      <Choice label="Gültig bis" hint={until ? `${longDate(until)} ${until.slice(0, 4)} · danach automatisch gesperrt` : ""} options={accessValidChoices(yearEnd)} value={valid} onChange={setValid} disabled={locked} />
      {errors.form && <p role="alert" className="text-hint text-danger">{errors.form}</p>}
      {created ? (
        <>
          <CodeReveal code={created.code} masked={created.item.masked} title={created.class?.name ? `Neuer Zugangscode · Klasse ${created.class.name}` : "Neuer Zugangscode"} note={REVEAL_NOTE()} />
          <div className="grid grid-cols-2 gap-2.5">
            <Button className="flex-none" onClick={() => copyText(created.code)}>
              <CopyIcon className="size-4" /> Kopieren
            </Button>
            <Button variant="primary" className="flex-none" onClick={onDone}>
              <CheckIcon className="size-4" /> Fertig
            </Button>
          </div>
        </>
      ) : (
        <Button type="submit" variant="primary" disabled={busy} className="flex-none">
          <KeyIcon className="size-4" /> {busy ? "Wird erstellt…" : "Code erstellen"}
        </Button>
      )}
    </form>
  );
};

// Вікно «Neuer Zugangscode» (ПК — по центру, телефон — шторка). Список оновлюємо при закритті
// schoolId — «Code für neue Klasse» на «Schulen & Klassen»: эта школа уже выбрана
const NewAccessSheet = ({ open, schoolId = null, onClose }) => {
  const { yearEnd, reload, admin } = useAccessScope();
  const settingsReady = useAdminStore((s) => !admin || s.settings.status !== "loading");
  const reloadSchools = useAdminStore((s) => s.reloadSchools);
  // Список показує коди всіх класів — новий код буде в ньому, навіть якщо він для іншого класу
  const close = async () => {
    if (admin) await reloadSchools(); // код міг створити новий клас — спершу він має з'явитися в списку класів
    reload();
    onClose();
  };
  return (
    <Sheet open={open} onClose={close} desktop="dialog" eyebrow={admin ? "Admin · Zugangscodes" : "Zugangscodes"} title="Neuer Zugangscode">
      {open && settingsReady && <NewAccessForm yearEnd={yearEnd} schoolId={schoolId} onDone={close} />}
    </Sheet>
  );
};

export default NewAccessSheet;
