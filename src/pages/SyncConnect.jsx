import { useState } from "react";
import { FileText, ListChecks, Sun, Table2 } from "lucide-react";
import { toast } from "sonner";
import { connectError } from "../components/sync/connectError";
import Button from "../components/ui/Button";
import { CheckIcon, SyncIcon, WarningIcon } from "../components/ui/icons";
import { useLinkCode } from "../shared/store/linkCodeStore";
import { useSyncStore } from "../shared/store/syncStore";

// Что и как придёт на это устройство (только включённые части)
const PARTS = [
  { key: "notes", icon: FileText, title: "Notizen", hint: "werden zusammengeführt" },
  { key: "aufgaben", icon: ListChecks, title: "Aufgaben", hint: "Häkchen und eigene — zusammengeführt" },
  { key: "kurse", icon: Table2, title: "Meine Kurse", hint: "vom anderen Gerät übernommen" },
  { key: "darstellung", icon: Sun, title: "Darstellung & Fachfarben", hint: "vom anderen Gerät übernommen" },
];

// ─────────────────────────────────────────────────────────────
// «Gerät verbinden?» (макет 25 handy-09): открыли QR со Sync-Code (/mehr/sync#КОД).
// Показываем до выбора курсов: курсы, скорее всего, придут с кода. «Abbrechen» — просто забыть код из ссылки
// ─────────────────────────────────────────────────────────────
const SyncConnect = ({ code }) => {
  const clear = useLinkCode((s) => s.clear);
  const parts = useSyncStore((s) => s.parts);
  const connect = useSyncStore((s) => s.connect);
  const switchCode = useSyncStore((s) => s.switchCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await connect(code);
      if (res.status === "empty") await switchCode(res.code); // по QR код точно верный: пусто — значит, там ещё ничего не было
      toast.success("Gerät verbunden");
      clear();
    } catch (err) {
      setError(connectError(err));
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-dialog flex-col gap-4.5 bg-paper px-gutter pt-6 pb-6 lg:justify-center">
      <header className="space-y-1">
        <p className="text-hint font-extrabold text-accent-ink">Sync-Code aus dem QR</p>
        <h1 className="text-title text-ink">Gerät verbinden?</h1>
      </header>

      <div className="flex items-center gap-3.5 rounded-card bg-card px-3.5 py-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent-ink">
          <SyncIcon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-row font-black tracking-code break-all text-ink">{code}</span>
          <span className="block text-caption text-faint">dein Sync-Code</span>
        </span>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-hint font-extrabold text-faint">Das kommt auf dieses Gerät</h2>
        <ul className="rounded-card bg-card">
          {PARTS.filter((part) => parts[part.key] !== false).map((part) => (
            <li key={part.key} className="flex items-center gap-3 border-b border-hair px-3.5 py-3 last:border-0">
              <part.icon className="size-5 shrink-0 text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-row text-ink">{part.title}</span>
                <span className="block text-caption text-faint">{part.hint}</span>
              </span>
              <CheckIcon className="size-4 shrink-0 text-ok" />
            </li>
          ))}
        </ul>
        <p className="text-caption text-faint">Nichts geht verloren: Notizen von beiden Geräten bleiben. Was übertragen wird, kannst du später unter „Synchronisieren“ ändern.</p>
      </section>

      {error && (
        <p role="alert" className="flex gap-1.5 text-label text-danger">
          <WarningIcon className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-4 lg:mt-2">
        <Button variant="primary" onClick={go} disabled={busy} className="flex-none">
          <SyncIcon className="size-4" /> {busy ? "Wird verbunden …" : "Verbinden"}
        </Button>
        <Button onClick={clear} disabled={busy} className="flex-none">
          Abbrechen
        </Button>
      </div>
    </main>
  );
};

export default SyncConnect;
