import { useState } from "react";
import * as admin from "../../shared/api/admin";
import { useNow } from "../../shared/hooks/useNow";
import { useAdminStore } from "../../shared/store/adminStore";
import { hasRight, labelError } from "../../shared/utils/admin";
import Button from "../ui/Button";
import { CheckIcon, KeyIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import CodeReveal from "./CodeReveal";
import RightsFields from "./RightsFields";
import ValidFields from "./ValidFields";

const START_RIGHTS = { create: true, editOwn: true, editAll: false };

// Форма: поки код не створено — поля і «Code erzeugen»; після — поля лише для читання, код і «Fertig»
const NewCodeForm = ({ yearEnd, onDone }) => {
  const { today } = useNow();
  const [label, setLabel] = useState("");
  const [rights, setRights] = useState(START_RIGHTS);
  const [valid, setValid] = useState({ choice: yearEnd ? "schuljahresende" : "30d", date: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null); // { code, item } з відповіді сервера

  const create = async (event) => {
    event.preventDefault();
    const found = {
      label: labelError(label),
      rights: hasRight(rights) ? null : "Mindestens ein Recht auswählen.",
      valid: valid.choice === "date" && !(valid.date > today) ? "Bitte ein Datum in der Zukunft wählen." : null,
    };
    setErrors(found);
    if (Object.values(found).some(Boolean) || busy) return;
    setBusy(true);
    try {
      setCreated(await admin.createCode({ label: label.trim(), rights, valid: valid.choice === "date" ? valid.date : valid.choice }));
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setBusy(false);
    }
  };

  const locked = Boolean(created); // після створення нічого не змінюємо
  return (
    <form onSubmit={create} noValidate className="flex flex-col gap-4">
      <TextField id="code-label" label="Bezeichnung" placeholder="z. B. Code D" hint="Nur für dich sichtbar" error={errors.label} value={label} maxLength={40} readOnly={locked} onChange={(event) => setLabel(event.target.value)} autoComplete="off" />
      <RightsFields value={rights} onChange={setRights} disabled={locked} error={errors.rights} />
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

// Вікно «Neuer Editor-Code» (ПК — по центру, телефон — шторка знизу).
// Список оновлюємо при закритті: новий код у ньому з'явиться вже замаскованим
const NewCodeSheet = ({ open, onClose }) => {
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
    <Sheet open={open} onClose={close} desktop="dialog" eyebrow="Admin · Editor-Codes" title="Neuer Editor-Code">
      {/* поки вікно закрите, форми немає: кожне відкриття — нова порожня форма */}
      {open && settingsReady && <NewCodeForm yearEnd={yearEnd} onDone={close} />}
    </Sheet>
  );
};

export default NewCodeSheet;
