import { useState } from "react";
import { toast } from "sonner";
import { changeAdminPassword } from "../../../shared/api/admin";
import { useLockTimer } from "../../../shared/hooks/useLockTimer";
import { adminLoginErrorText, lockDuration } from "../../../shared/utils/authErrors";
import { ADMIN_PASSWORD_MIN, changedText, lengthError } from "../../../shared/utils/passwords";
import Button from "../../ui/Button";
import { KeyIcon } from "../../ui/icons";
import PasswordField from "../../ui/PasswordField";
import PasswordSection from "./PasswordSection";

// Помилку сервера ставимо під потрібне поле: неправильний поточний пароль — під «Aktuelles Passwort»,
// закороткий новий (422) — під «Neues Passwort»
function errorsFrom(error) {
  if (error.status === 422) return { next: error.message };
  return { current: adminLoginErrorText(error) }; // wrong_password («Noch N Versuche»), 429, мережа
}

// ─────────────────────────────────────────────────────────────
// «Admin-Passwort» (макети 14b handy-01/04/05, pc-01/04/05). Без вікна-питання:
// цей пристрій лишається в адмінці, виходять лише інші. Помилки рахуються в ліміт входу адміна.
// ─────────────────────────────────────────────────────────────
const AdminPasswordForm = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { locked, lockFor } = useLockTimer();

  const submit = async (event) => {
    event.preventDefault();
    const found = { current: current ? null : "Bitte das aktuelle Passwort eingeben.", next: lengthError(next, ADMIN_PASSWORD_MIN) };
    setErrors(found);
    if (found.current || found.next || busy || locked) return;
    setBusy(true);
    try {
      const result = await changeAdminPassword(current, next);
      toast.success(changedText("Admin-Passwort geändert", result.otherSessionsEnded));
      setCurrent("");
      setNext("");
    } catch (error) {
      setErrors(errorsFrom(error));
      lockFor(lockDuration(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PasswordSection title="Admin-Passwort">
      <form onSubmit={submit} noValidate>
        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-2 lg:gap-3">
          <PasswordField id="admin-password-current" label="Aktuelles Passwort" autoComplete="current-password" error={errors.current} value={current} onChange={(event) => setCurrent(event.target.value)} />
          <PasswordField
            id="admin-password-new"
            label="Neues Passwort"
            autoComplete="new-password"
            placeholder={`mindestens ${ADMIN_PASSWORD_MIN} Zeichen`}
            error={errors.next}
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
        </div>
        <p className="mt-1.5 text-caption text-faint">Andere Admin-Geräte werden abgemeldet, dieses nicht.</p>
        <Button type="submit" variant="primary" disabled={busy || locked} className="mt-3.5 w-full lg:w-fit lg:flex-none lg:px-5">
          <KeyIcon className="size-4" /> Admin-Passwort ändern
        </Button>
        <p className="mt-3.5 text-caption text-faint lg:mt-4 lg:border-t lg:border-hair lg:pt-3.5">
          Vergessen? Neu setzen geht nur auf dem Server.
          {/* команду бачить лише ПК: на телефоні вона некрасиво переноситься, а на сервер там однаково не зайти */}
          <span className="hidden font-bold text-muted lg:block">orbook set-admin-password</span>
        </p>
      </form>
    </PasswordSection>
  );
};

export default AdminPasswordForm;
