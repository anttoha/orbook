import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { runDanger } from "../../shared/api/admin";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { TrashIcon, WarningIcon } from "../ui/icons";
import TextField from "../ui/TextField";

// Текст після невдалої спроби
function failText(result) {
  if (result.status === "wrong_password") return result.attemptsLeft > 0 ? `Passwort stimmt nicht. Noch ${result.attemptsLeft} ${result.attemptsLeft === 1 ? "Versuch" : "Versuche"}.` : "Passwort stimmt nicht.";
  if (result.status === "locked") return `Zu viele Fehlversuche. Bitte in ${Math.ceil(result.retryAfter / 60)} Minuten erneut versuchen.`;
  return result.message;
}

// ─────────────────────────────────────────────────────────────
// Вікно «Gefahrenzone» (макет 48): треба вписати LÖSCHEN і пароль адміна.
// Перед дією сервер сам робить бекап і повертає його ім'я — показуємо в сповіщенні.
//   action — "deleteExams" | "deleteSync" | "resetStats" | "purge"
//   before — для purge: «видалити Klausuren до цієї дати» (поле дати у вікні)
//   onDone(result) — після успіху (оновити лічильники)
// ─────────────────────────────────────────────────────────────
const DangerForm = ({ action, title, text, confirmLabel, withDate, today, onClose, onDone }) => {
  const [word, setWord] = useState("");
  const [password, setPassword] = useState("");
  const [before, setBefore] = useState(today);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []); // вікно закрили — таймер не потрібен

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await runDanger(action, { word, currentPassword: password, before: withDate ? before : undefined });
      if (result.status === "done") {
        toast.success(`Erledigt · Backup: ${result.backup}`, { duration: 8000 });
        onDone(result);
        onClose();
        return;
      }
      setError(failText(result));
      setPassword("");
      if (result.status === "locked") {
        setLocked(true); // 5 помилок → 30 хвилин, як вхід адміна
        timer.current = setTimeout(() => setLocked(false), result.retryAfter * 1000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const ready = word === "LÖSCHEN" && password && (!withDate || before) && !busy && !locked;
  const body = (
    <>
      {withDate && <TextField id="danger-before" label="Klausuren vor dem" type="date" max={today} value={before} onChange={(event) => setBefore(event.target.value)} />}
      <TextField id="danger-word" label="Zum Bestätigen LÖSCHEN eintippen" value={word} autoComplete="off" autoCapitalize="characters" spellCheck={false} onChange={(event) => setWord(event.target.value)} />
      <TextField id="danger-password" label="Admin-Passwort" type="password" autoComplete="current-password" value={password} error={error} onChange={(event) => setPassword(event.target.value)} />
      <p className="text-label text-faint">Vorher wird automatisch ein Backup angelegt.</p>
    </>
  );

  return (
    <ConfirmDialog open onClose={onClose} icon={<WarningIcon className="size-6.5 text-danger" />} title={title} text={text} body={body}>
      <Button onClick={onClose}>Abbrechen</Button>
      <Button variant="danger" disabled={!ready} onClick={run}>
        <TrashIcon className="size-4" /> {confirmLabel ?? "Endgültig löschen"}
      </Button>
    </ConfirmDialog>
  );
};

// Поки вікно закрите, форми немає: кожне відкриття починається з порожніх полів
const DangerDialog = ({ open, ...props }) => (open ? <DangerForm {...props} /> : null);

export default DangerDialog;
