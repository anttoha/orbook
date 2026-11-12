import { useState } from "react";
import { toast } from "sonner";
import { useSyncStore } from "../../shared/store/syncStore";
import { connectError } from "./connectError";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { SyncIcon, WarningIcon } from "../ui/icons";
import TextField from "../ui/TextField";


// ─────────────────────────────────────────────────────────────
// «Anderes Gerät verbinden» (макет 21): ввести код з іншого пристрою.
// Перевіряємо пробним GET: якщо під кодом нічого немає — питаємо (захист від помилки в коді).
// ─────────────────────────────────────────────────────────────
const ConnectDevice = () => {
  const connect = useSyncStore((s) => s.connect);
  const switchCode = useSyncStore((s) => s.switchCode);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false); // ключі рахуються до 1–2 с
  const [error, setError] = useState(null);
  const [emptyCode, setEmptyCode] = useState(null); // код без нотаток на сервері: чекає підтвердження

  const done = () => {
    setText("");
    toast.success("Gerät verbunden");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await connect(text);
      if (res.status === "empty") setEmptyCode(res.code);
      else done();
    } catch (err) {
      setError(connectError(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmEmpty = async () => {
    const code = emptyCode;
    setEmptyCode(null);
    await switchCode(code);
    done();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="mt-1 text-hint font-extrabold text-faint">Anderes Gerät verbinden</h2>
      <TextField
        id="sync-code"
        label="Code eingeben"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        error={error}
        inputClassName="h-13.5 text-subhead tracking-code"
      />
      <Button type="submit" variant="primary" disabled={busy || !text.trim()} className="flex-none">
        <SyncIcon className="size-4" /> {busy ? "Wird verbunden …" : "Verbinden"}
      </Button>
      {/* часть 25: проще всего — QR этого кода на другом устройстве */}
      <p className="text-center text-label text-faint">
        Oder: <span className="font-bold text-muted">am anderen Gerät den QR scannen</span>
      </p>

      <ConfirmDialog
        open={Boolean(emptyCode)}
        onClose={() => setEmptyCode(null)}
        icon={<WarningIcon className="size-6.5 text-accent-ink" />}
        title="Trotzdem verwenden?"
        text="Zu diesem Code gibt es noch keine Notizen. Prüf, ob du dich vertippt hast."
      >
        <Button onClick={() => setEmptyCode(null)}>Abbrechen</Button>
        <Button variant="primary" onClick={confirmEmpty}>
          Verwenden
        </Button>
      </ConfirmDialog>
    </form>
  );
};

export default ConnectDevice;
