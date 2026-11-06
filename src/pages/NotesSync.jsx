import { useState } from "react";
import { useLocation } from "react-router-dom";
import ConnectDevice from "../components/sync/ConnectDevice";
import RenewCode from "../components/sync/RenewCode";
import SyncCodeCard from "../components/sync/SyncCodeCard";
import Button from "../components/ui/Button";
import { SyncIcon, WarningIcon } from "../components/ui/icons";
import PageHeader from "../components/ui/PageHeader";
import StateScreen from "../components/ui/StateScreen";
import { useSyncAllowed } from "../shared/hooks/useNotesSync";
import { useSyncStore } from "../shared/store/syncStore";

// ─────────────────────────────────────────────────────────────
// «Notizen synchronisieren» (макет 21 — телефон, 27 — ПК; на ПК поки одна колонка, ліве меню — частина 12).
// Без коду — кнопка «Code erzeugen». Код створює тільки застосунок: свій придумати не можна.
// ─────────────────────────────────────────────────────────────
const NotesSync = () => {
  const code = useSyncStore((s) => s.code);
  const allowed = useSyncAllowed();
  const from = useLocation().state?.from;

  return (
    <section className="flex flex-col gap-4.5 lg:max-w-186">
      <PageHeader backTo={from ?? "/mehr"} eyebrow="Notizen" title="Synchronisieren" />

      {!allowed ? (
        <StateScreen icon={SyncIcon} title="Ausgeschaltet" text="Deine Schule hat das Synchronisieren ausgeschaltet. Deine Notizen bleiben auf diesem Gerät." />
      ) : (
        <>
          <p className="text-body-sm leading-5.5 text-muted">Deine Notizen liegen auf diesem Gerät. Mit dem Code holst du sie auf ein anderes Gerät — ohne Konto und ohne Namen.</p>
          {code ? <SyncCodeCard code={code} /> : <StartSync />}
          <p className="flex gap-2.5 rounded-field bg-tint px-3.25 py-3 text-label text-accent-ink">
            <WarningIcon className="mt-0.5 size-4 shrink-0" />
            <span>Code weg = Notizen weg. Schreib ihn dir irgendwo auf.</span>
          </p>
          <ConnectDevice />
          {code && <RenewCode />}
        </>
      )}
    </section>
  );
};

// Синхронізація ще вимкнена: створити перший код
const StartSync = () => {
  const enable = useSyncStore((s) => s.enable);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    await enable(); // помилки (наприклад, немає мережі) показує картка коду
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-card bg-card px-4 py-4.5">
      <p className="text-hint font-extrabold text-faint">Notizen synchronisieren</p>
      <p className="text-body-sm text-ink">Noch kein Sync-Code auf diesem Gerät. Erzeuge einen, um deine Notizen auf ein anderes Gerät zu holen.</p>
      <Button variant="primary" onClick={start} disabled={busy} className="flex-none">
        <SyncIcon className="size-4" /> Code erzeugen
      </Button>
    </div>
  );
};

export default NotesSync;
