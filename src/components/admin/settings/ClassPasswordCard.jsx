import { useState } from "react";
import { toast } from "sonner";
import { changeClassPassword } from "../../../shared/api/admin";
import { useNow } from "../../../shared/hooks/useNow";
import { useAdminStore } from "../../../shared/store/adminStore";
import { classPasswordText } from "../../../shared/utils/admin";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { KeyIcon, WarningIcon } from "../../ui/icons";
import TextField from "../../ui/TextField";
import SettingsCard from "./SettingsCard";

const MIN_LENGTH = 10; // так перевіряє сервер (у макеті «8» — застаріло)

// «Klassenpasswort»: окрема дія, не чекає «Änderungen speichern». Усі пристрої класу вийдуть — питаємо заздалегідь
const ClassPasswordCard = ({ changedAt, className }) => {
  const { today } = useNow();
  const reloadSettings = useAdminStore((s) => s.reloadSettings);
  const reloadOverview = useAdminStore((s) => s.reloadOverview);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const since = classPasswordText(changedAt, today)?.since;

  const ask = () => {
    if (password.length < MIN_LENGTH) return setError(`Mindestens ${MIN_LENGTH} Zeichen.`);
    setError(null);
    setConfirming(true);
  };

  const change = async () => {
    setBusy(true);
    try {
      const result = await changeClassPassword(password);
      toast.success(`Passwort geändert · ${result.devicesSignedOut} Geräte abgemeldet`);
      setPassword("");
      reloadSettings();
      reloadOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <SettingsCard title="Klassenpasswort" plain className={className}>
      <TextField
        id="class-password-new"
        label="Neues Passwort"
        type="password"
        autoComplete="new-password"
        placeholder={`mindestens ${MIN_LENGTH} Zeichen`}
        hint={`${since ? `${since} · ` : ""}alle Geräte werden danach abgemeldet`}
        error={error}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button variant="primary" className="mt-3.5 w-full flex-none px-5 lg:w-fit" onClick={ask}>
        <KeyIcon className="size-4" /> Passwort ändern
      </Button>
      <div className="h-3.5 max-lg:hidden" />

      <ConfirmDialog open={confirming} onClose={() => setConfirming(false)} icon={<WarningIcon className="size-6.5 text-danger" />} title="Klassenpasswort ändern?" text="Alle Geräte der Klasse werden sofort abgemeldet und brauchen das neue Passwort. Sag es der Klasse vorher.">
        <Button onClick={() => setConfirming(false)}>Abbrechen</Button>
        <Button variant="primary" disabled={busy} onClick={change}>
          Ändern
        </Button>
      </ConfirmDialog>
    </SettingsCard>
  );
};

export default ClassPasswordCard;
