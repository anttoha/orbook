import { useState } from "react";
import { ChevronRight, Info } from "lucide-react";
import { useAccessActions } from "../../../shared/hooks/useAccessActions";
import { useNow } from "../../../shared/hooks/useNow";
import { useAdminStore } from "../../../shared/store/adminStore";
import { accessValidChoices, accessValidUntil, audienceChip, choiceFromDevices, customDevicesError, devicesFromChoice, devicesText } from "../../../shared/utils/accessCodes";
import { labelError, lastUsedText, validText } from "../../../shared/utils/admin";
import { cn } from "../../../shared/utils/cn";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Field from "../../ui/Field";
import { CheckIcon, LockIcon, RenewIcon, TrashIcon } from "../../ui/icons";
import Segmented from "../../ui/Segmented";
import Sheet from "../../ui/Sheet";
import TextField from "../../ui/TextField";
import CodeReveal from "../CodeReveal";
import { accessActions, passwordActions } from "./accessActions";
import DevicesField from "./DevicesField";
import InviteSheet from "./InviteSheet";

// Значення праворуч у шторці: «30», «Schuljahresende», «9 angemeldet»
const hintOf = (item, code) =>
  item.hint ?? { limit: code.maxDevices ?? "unbegrenzt", validity: validText(code), signout: `${code.devices ?? 0} angemeldet` }[item.kind];

// Шторка дій на телефоні (макет 14c handy-04)
const ActionsSheet = ({ code, onAction, onClose }) => {
  const { today } = useNow();
  return (
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={`${code.masked} · ${code.active ? "aktiv" : "gesperrt"} · ${audienceChip(code.audience)}`} title={code.label}>
      <p className="-mt-2 text-body-sm text-muted">
        {devicesText(code.devices, code.maxDevices)} · {lastUsedText(code.lastUsedAt, today)}
      </p>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
        {accessActions(code).map((item) => (
          <li key={item.kind}>
            <button type="button" onClick={() => onAction(item.kind, code)} className={cn("flex h-12.5 w-full items-center gap-3.25 text-left", item.danger ? "text-danger" : item.accent ? "text-accent-ink" : "text-ink")}>
              <item.icon className={cn("size-4.5 shrink-0", item.danger ? "text-danger" : item.accent ? "text-accent-ink" : "text-muted")} />
              <span className={cn("flex-1 text-row", item.accent ? "font-bold" : "font-medium")}>{item.sheetLabel ?? item.label}</span>
              {!item.danger && hintOf(item, code) != null && <span className="max-w-40 truncate text-label text-faint">{hintOf(item, code)}</span>}
              {!item.danger && <ChevronRight className="size-4 shrink-0 text-faint2" />}
            </button>
          </li>
        ))}
      </ul>
      <p className="flex gap-2.5 rounded-card bg-sand px-3.5 py-3 text-label text-muted">
        <Info className="mt-0.5 size-4 shrink-0" /> Sperren, Löschen, Abmelden: die Geräte müssen sich sofort neu anmelden. Andere Codes bleiben.
      </p>
    </Sheet>
  );
};

// Шторка дій для рядка «Klassenpasswort» на телефоні
const PasswordSheet = ({ password, onAction, onClose }) => {
  const { today } = useNow();
  return (
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={`Gemeinsames Passwort · ${password.enabled ? "aktiv" : "aus"}`} title="Klassenpasswort">
      <p className="-mt-2 text-body-sm text-muted">
        {password.devices} {password.devices === 1 ? "Gerät" : "Geräte"} · {lastUsedText(password.lastUsedAt, today)}
      </p>
      <ul className="divide-y divide-hair rounded-card bg-card px-3.5">
        {passwordActions(password).map((item) => (
          <li key={item.kind}>
            <button type="button" onClick={() => onAction(item.kind)} className="flex h-12.5 w-full items-center gap-3.25 text-left text-ink">
              <item.icon className="size-4.5 shrink-0 text-muted" />
              <span className="flex-1 text-row font-medium">{item.label}</span>
              <ChevronRight className="size-4 shrink-0 text-faint2" />
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
};

// Маленьке вікно з однією формою і «Speichern»
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
    <Sheet open onClose={onClose} desktop="dialog" eyebrow={`Zugangscode · ${code.label}`} title={title}>
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
      <TextField id="access-rename" label="Bezeichnung" hint="Keine echten Namen — lieber »Eltern« oder »Schüler 07«." value={label} maxLength={40} error={error} onChange={(event) => setLabel(event.target.value)} autoComplete="off" />
    </FormSheet>
  );
};

const LimitSheet = ({ code, actions, onClose }) => {
  const choice = choiceFromDevices(code.maxDevices);
  const [value, setValue] = useState({ choice, custom: choice === "custom" ? String(code.maxDevices) : "" });
  const [error, setError] = useState(null);
  const save = () => {
    const found = customDevicesError(value.choice, value.custom);
    setError(found);
    return found ? false : actions.setLimit(code, devicesFromChoice(value.choice, value.custom));
  };
  return (
    <FormSheet code={code} title="Geräte-Limit" onClose={onClose} onSave={save}>
      <DevicesField value={value} onChange={setValue} error={error} hint={`Jetzt angemeldet: ${code.devices ?? 0}. Wer schon drin ist, bleibt drin.`} />
    </FormSheet>
  );
};

const ValiditySheet = ({ code, actions, onClose }) => {
  const { today } = useNow();
  const yearEnd = useAdminStore((s) => s.settings.data?.settings.school.yearEnd ?? null);
  const [choice, setChoice] = useState(yearEnd ? "schuljahresende" : "halbjahr");
  const save = () => actions.setValidUntil(code, accessValidUntil(choice, today, yearEnd));
  return (
    <FormSheet code={code} title="Gültigkeit" onClose={onClose} onSave={save}>
      <Field label="Gültig bis">
        <Segmented label="Gültig bis" size="form" options={accessValidChoices(yearEnd)} value={choice} onChange={setChoice} />
        <p className="mt-1.5 text-caption text-faint">Jetzt: {validText(code)}</p>
      </Field>
    </FormSheet>
  );
};

// Підтвердження з двома кнопками; busy — поки йде запит
const Confirm = ({ icon, title, text, button, variant = "danger", onClose, onConfirm }) => {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    const result = await onConfirm();
    setBusy(false);
    if (result) onClose(result);
  };
  return (
    <ConfirmDialog open onClose={() => onClose()} icon={icon} title={title} text={text}>
      <Button onClick={() => onClose()}>Abbrechen</Button>
      <Button variant={variant} disabled={busy} onClick={confirm}>
        {button}
      </Button>
    </ConfirmDialog>
  );
};

// «9 Geräte werden sofort abgemeldet.» / «Niemand ist gerade angemeldet.»
const devicesLine = (n) => (n ? `${n} ${n === 1 ? "Gerät wird" : "Geräte werden"} sofort abgemeldet.` : "Gerade ist kein Gerät angemeldet.");

// Вікна-підтвердження для коду: lock, signout, regenerate, delete
const CONFIRMS = {
  lock: (code, a) => ({
    icon: <LockIcon className="size-6.5 text-danger" />,
    title: `»${code.label}« sperren?`,
    text: `${devicesLine(code.devices)} Später wieder einschalten geht — dann melden sie sich mit dem gleichen Code neu an.`,
    button: "Sperren",
    run: () => a.toggle(code),
  }),
  signout: (code, a) => ({
    icon: <LockIcon className="size-6.5 text-danger" />,
    title: "Geräte abmelden?",
    text: `${devicesLine(code.devices)} Der Code bleibt gültig — z. B. wenn jemand ein neues Handy hat.`,
    button: "Abmelden",
    run: () => a.signOut(code),
  }),
  regenerate: (code, a) => ({
    icon: <RenewIcon className="size-6.5 text-accent" />,
    title: `»${code.label}« neu erzeugen?`,
    text: `Der alte Code geht sofort nicht mehr. ${devicesLine(code.devices)}`,
    button: "Neu erzeugen",
    variant: "primary",
    run: () => a.regenerate(code),
  }),
  // Посилання-запрошення (частина 16): нове замість старого; хто вже увійшов — лишається
  "invite-renew": (code, a) => ({
    icon: <RenewIcon className="size-6.5 text-accent" />,
    title: "Neuen Link erzeugen?",
    text: "Der alte Link und der alte QR gehen dann nicht mehr. Wer schon drin ist, bleibt angemeldet.",
    button: "Neuer Link",
    variant: "primary",
    run: () => a.renewInvite(code),
  }),
  delete: (code, a) => ({
    icon: <TrashIcon className="size-6.5 text-danger" />,
    title: `»${code.label}« löschen?`,
    text: `Der Code geht sofort nicht mehr. ${devicesLine(code.devices)}`,
    button: "Löschen",
    run: () => a.remove(code),
  }),
};

// Klassenpasswort: вимкнути — з підтвердженням; вийти всім — теж
const PASSWORD_CONFIRMS = {
  "password-off": (password, a) => ({
    icon: <LockIcon className="size-6.5 text-danger" />,
    title: "Klassenpasswort ausschalten?",
    text: `${devicesLine(password.devices)} Danach kommt man nur noch mit Zugangscode rein.`,
    button: "Ausschalten",
    run: () => a.setPassword(false),
  }),
  "password-signout": (password, a) => ({
    icon: <LockIcon className="size-6.5 text-danger" />,
    title: "Geräte abmelden?",
    text: `${devicesLine(password.devices)} Mit dem Klassenpasswort kann man sich wieder anmelden.`,
    button: "Abmelden",
    run: () => a.signOutPassword(),
  }),
};

// ─────────────────────────────────────────────────────────────
// Усі вікна дій. action — { kind, code } або null; onChange — відкрити інше / закрити.
//   menu, invite, invite-renew (частина 16), rename, limit, validity, lock, signout, regenerate, delete, reveal (після Neu erzeugen),
//   password-menu, password-off, password-signout (Klassenpasswort; «Passwort ändern» відкриває сторінка сама)
// ─────────────────────────────────────────────────────────────
const AccessDialogs = ({ action, password, onChange, onPasswordAction }) => {
  const actions = useAccessActions();
  if (!action) return null;
  const { kind, code } = action;
  const close = () => onChange(null);

  // Пункт меню: «Entsperren» і «Einschalten» — одразу; решта — своє вікно
  const choose = (next, target) => {
    if (next === "lock" && !target.active) {
      close();
      actions.toggle(target);
    } else onChange({ kind: next, code: target });
  };

  if (kind === "menu") return <ActionsSheet code={code} onAction={choose} onClose={close} />;
  if (kind === "password-menu" && password) {
    const pick = (next) => {
      close();
      onPasswordAction(next, null); // сторінка знає, що робити: перейти, питати чи одразу ввімкнути
    };
    return <PasswordSheet password={password} onAction={pick} onClose={close} />;
  }
  if (kind === "invite") return <InviteSheet code={code} onClose={close} onRenew={() => onChange({ kind: "invite-renew", code })} />;
  if (kind === "rename") return <RenameSheet code={code} actions={actions} onClose={close} />;
  if (kind === "limit") return <LimitSheet code={code} actions={actions} onClose={close} />;
  if (kind === "validity") return <ValiditySheet code={code} actions={actions} onClose={close} />;
  if (kind === "reveal") {
    return (
      <Sheet open onClose={close} desktop="dialog" eyebrow={`Zugangscode · ${code.label}`} title="Neuer Code">
        <CodeReveal code={action.result.code} masked={action.result.item.masked} title="Neuer Zugangscode · nur jetzt sichtbar" note={`Danach siehst du nur noch ${action.result.item.masked}.`} />
        <Button variant="primary" className="flex-none" onClick={close}>
          <CheckIcon className="size-4" /> Fertig
        </Button>
      </Sheet>
    );
  }

  const make = CONFIRMS[kind] ?? PASSWORD_CONFIRMS[kind];
  if (!make) return null;
  const spec = make(code ?? password, actions);
  // Після «Neu erzeugen» показуємо новий код; після решти — просто закриваємо
  // Після «Neuer Link» — назад до вікна «Einladen» (з новим QR), навіть якщо скасували
  const done = (result) => {
    if (kind === "regenerate" && result) return onChange({ kind: "reveal", code, result });
    if (kind === "invite-renew") return onChange({ kind: "invite", code: { ...code, invite: code.invite ?? {} } });
    return close();
  };
  return <Confirm {...spec} onClose={done} onConfirm={spec.run} />;
};

export default AccessDialogs;
