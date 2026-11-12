import { useState } from "react";
import { ChevronRight, Info } from "lucide-react";
import { useCodeActions } from "../../shared/hooks/useCodeActions";
import { useNow } from "../../shared/hooks/useNow";
import { useAdminStore } from "../../shared/store/adminStore";
import { editableRights, entriesCount, hasRight, labelError, lastUsedText, rightsText, validText, validUntilFor } from "../../shared/utils/admin";
import { cn } from "../../shared/utils/cn";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { CheckIcon, RenewIcon, TrashIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";
import TextField from "../ui/TextField";
import { codeActions } from "./codeActions";
import CodeQr from "./CodeQr";
import CodeReveal from "./CodeReveal";
import RightsFields from "./RightsFields";
import ValidFields from "./ValidFields";

// Значення праворуч у шторці телефона: «Eintragen, eigene», «31. Juli»
const hintOf = (kind, code) => ({ rights: rightsText(code.rights, code.kind), validity: validText(code) })[kind];

// Шторка «Code-Aktionen» на телефоні (макет 43)
const ActionsSheet = ({ code, onAction, onClose }) => {
  const { today } = useNow();
  return (
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={`${code.masked} · ${code.active ? "aktiv" : "gesperrt"}`} title={code.label}>
      <p className="-mt-2 text-body-sm text-muted">
        {entriesCount(code)} Einträge · {lastUsedText(code.lastUsedAt, today)}
      </p>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
        {codeActions(code).map((item) => (
          <li key={item.kind}>
            <button type="button" onClick={() => onAction(item.kind, code)} className={cn("flex h-12.5 w-full items-center gap-3.25 text-left", item.danger ? "text-danger" : "text-ink")}>
              <item.icon className={cn("size-4.5 shrink-0", item.danger ? "text-danger" : "text-muted")} />
              <span className="flex-1 text-row font-medium">{item.label}</span>
              {(item.hint ?? hintOf(item.kind, code)) && <span className="max-w-40 truncate text-label text-faint">{item.hint ?? hintOf(item.kind, code)}</span>}
              {!item.danger && <ChevronRight className="size-4 shrink-0 text-faint2" />}
            </button>
          </li>
        ))}
      </ul>
      <p className="flex gap-2.5 rounded-card bg-sand px-3.5 py-3 text-label text-muted">
        <Info className="mt-0.5 size-4 shrink-0" /> Einträge dieses Codes bleiben beim Löschen erhalten.
      </p>
    </Sheet>
  );
};

// Маленьке вікно з однією формою і кнопкою «Speichern»
const FormSheet = ({ code, title, onClose, onSave, children }) => {
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const ok = await onSave();
    setBusy(false);
    if (ok) onClose();
  };
  return (
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={`Admin · ${code.label}`} title={title}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {children}
        <Button type="submit" variant="primary" disabled={busy} className="flex-none">
          <CheckIcon className="size-4" /> Speichern
        </Button>
      </form>
    </Sheet>
  );
};

const RenameSheet = ({ code, actions, onClose }) => {
  const [label, setLabel] = useState(code.label);
  const [error, setError] = useState(null);
  const save = () => {
    const found = labelError(label);
    setError(found);
    return found ? false : actions.rename(code, label);
  };
  return (
    <FormSheet code={code} title="Umbenennen" onClose={onClose} onSave={save}>
      <TextField id="code-rename" label="Bezeichnung" hint="Keine echten Namen — lieber »Code A« oder »Klassensprecher«." value={label} maxLength={40} error={error} onChange={(event) => setLabel(event.target.value)} autoComplete="off" />
    </FormSheet>
  );
};

const RightsSheet = ({ code, actions, onClose }) => {
  const [rights, setRights] = useState(code.rights);
  const [error, setError] = useState(null);
  const save = () => {
    setError(hasRight(rights) ? null : "Mindestens ein Recht auswählen.");
    return hasRight(rights) ? actions.setRights(code, editableRights(code, rights)) : false;
  };
  return (
    <FormSheet code={code} title="Rechte ändern" onClose={onClose} onSave={save}>
      <RightsFields value={rights} onChange={setRights} error={error} kind={code.kind} />
    </FormSheet>
  );
};

const ValiditySheet = ({ code, actions, onClose }) => {
  const { today } = useNow();
  const yearEnd = useAdminStore((s) => s.settings.data?.settings.school.yearEnd ?? null);
  const [valid, setValid] = useState({ choice: yearEnd ? "schuljahresende" : "30d", date: code.validUntil ?? "" });
  const [error, setError] = useState(null);
  const save = () => {
    const date = validUntilFor(valid.choice, { todayIso: today, yearEnd, date: valid.date });
    const found = !date || date < today ? "Bitte ein Datum ab heute wählen." : null;
    setError(found);
    return found ? false : actions.setValidUntil(code, date);
  };
  return (
    <FormSheet code={code} title="Gültigkeit" onClose={onClose} onSave={save}>
      <p className="-mt-1 text-body-sm text-muted">Jetzt: {validText(code)}</p>
      <ValidFields choice={valid.choice} date={valid.date} yearEnd={yearEnd} onChange={setValid} error={error} />
    </FormSheet>
  );
};

// ─────────────────────────────────────────────────────────────
// Усі вікна дій з кодом. action — { kind, code } або null; onChange — відкрити інше вікно / закрити.
//   menu (шторка телефона), rename, rights, validity, regenerate, delete, reveal (новий код після Neu erzeugen)
// «lock» вікна не має: одразу Sperren / Entsperren.
// ─────────────────────────────────────────────────────────────
const CodeDialogs = ({ action, onChange }) => {
  const actions = useCodeActions();
  const [busy, setBusy] = useState(false);
  const close = () => onChange(null);
  if (!action) return null;
  const { kind, code } = action;

  // Пункт меню: «Sperren» виконуємо одразу, решта — відкрити своє вікно
  const choose = (next, target) => {
    if (next === "lock") {
      close();
      actions.toggle(target);
    } else onChange({ kind: next, code: target });
  };

  const confirm = async (request) => {
    setBusy(true);
    const result = await request();
    setBusy(false);
    return result;
  };

  if (kind === "menu") return <ActionsSheet code={code} onAction={choose} onClose={close} />;
  if (kind === "rename") return <RenameSheet code={code} actions={actions} onClose={close} />;
  if (kind === "rights") return <RightsSheet code={code} actions={actions} onClose={close} />;
  if (kind === "validity") return <ValiditySheet code={code} actions={actions} onClose={close} />;

  if (kind === "regenerate") {
    const regenerate = async () => {
      const result = await confirm(() => actions.regenerate(code));
      if (result) onChange({ kind: "reveal", code, result });
    };
    return (
      <ConfirmDialog open onClose={close} icon={<RenewIcon className="size-6.5 text-accent" />} title={`${code.label} neu erzeugen?`} text="Der alte Code geht sofort nicht mehr. Geräte mit dem alten Code fragen wieder nach einem Code.">
        <Button onClick={close}>Abbrechen</Button>
        <Button variant="primary" disabled={busy} onClick={regenerate}>
          Neu erzeugen
        </Button>
      </ConfirmDialog>
    );
  }

  if (kind === "reveal") {
    return (
      <Sheet open onClose={close} desktop="dialog" eyebrow={`Admin · ${code.label}`} title="Neuer Code">
        <CodeReveal code={action.result.code} masked={action.result.item.masked} />
        <CodeQr code={action.result.code} kind={code.kind} teacher={code.kind === "teacher" ? code.label : null} rights={code.rights} />
        <Button variant="primary" className="flex-none" onClick={close}>
          <CheckIcon className="size-4" /> Fertig
        </Button>
      </Sheet>
    );
  }

  // delete
  const remove = async () => {
    if (await confirm(() => actions.remove(code))) close();
  };
  return (
    <ConfirmDialog open onClose={close} icon={<TrashIcon className="size-6.5 text-danger" />} title={`${code.label} löschen?`} text="Der Code geht sofort nicht mehr. Die Einträge dieses Codes bleiben erhalten, als Autor steht dann »unbekannt«.">
      <Button onClick={close}>Abbrechen</Button>
      <Button variant="danger" disabled={busy} onClick={remove}>
        <TrashIcon className="size-4" /> Löschen
      </Button>
    </ConfirmDialog>
  );
};

export default CodeDialogs;
