import { useState } from "react";
import { useLocation } from "react-router-dom";
import ConnectDevice from "../components/sync/ConnectDevice";
import RenewCode from "../components/sync/RenewCode";
import SyncCodeCard from "../components/sync/SyncCodeCard";
import SyncParts from "../components/sync/SyncParts";
import { SyncQrCard } from "../components/sync/SyncQr";
import Button from "../components/ui/Button";
import { SyncIcon, WarningIcon } from "../components/ui/icons";
import PageHeader from "../components/ui/PageHeader";
import StateScreen from "../components/ui/StateScreen";
import { useSyncAllowed } from "../shared/hooks/useNotesSync";
import { useSyncStore } from "../shared/store/syncStore";

// ─────────────────────────────────────────────────────────────
// «Synchronisieren» (макет 21 / PC 27; часть 25 — handy-07, pc-02): один Sync-Code для всего —
// Notizen, Aufgaben, Meine Kurse, Darstellung. Что именно — переключатели. На ПК справа QR для телефона.
// Код создаёт только приложение: свой придумать нельзя.
// ─────────────────────────────────────────────────────────────
const NotesSync = () => {
  const code = useSyncStore((s) => s.code);
  const allowed = useSyncAllowed();
  const from = useLocation().state?.from;

  return (
    <section className="flex flex-col gap-4.5">
      <PageHeader backTo={from ?? "/mehr"} eyebrow="Einstellungen" title="Synchronisieren" panelTitle="Synchronisieren" />

      {!allowed ? (
        <StateScreen icon={SyncIcon} title="Ausgeschaltet" text="Deine Schule hat das Synchronisieren ausgeschaltet. Alles bleibt auf diesem Gerät." />
      ) : (
        <div className="flex items-start gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-4.5 lg:max-w-117.5">
            <p className="text-body-sm leading-5.5 text-muted">Alles von diesem Gerät auch auf deinem anderen — ohne Konto und ohne Namen. Code eingeben oder QR scannen, fertig.</p>
            {code ? <SyncCodeCard code={code} /> : <StartSync />}
            <SyncParts />
            <p className="flex gap-2.5 rounded-field bg-tint px-3.25 py-3 text-label text-accent-ink">
              <WarningIcon className="mt-0.5 size-4 shrink-0" />
              <span>Code weg = Daten weg. Schreib ihn dir irgendwo auf.</span>
            </p>
            <ConnectDevice />
            {code && <RenewCode />}
          </div>
          <SyncQrCard />
        </div>
      )}
    </section>
  );
};

// Синхронизация ещё выключена: создать первый код
const StartSync = () => {
  const enable = useSyncStore((s) => s.enable);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    await enable(); // ошибки (например, нет сети) показывает карточка кода
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-card bg-card px-4 py-4.5">
      <p className="text-hint font-extrabold text-faint">Synchronisieren</p>
      <p className="text-body-sm text-ink">Noch kein Sync-Code auf diesem Gerät. Erzeuge einen, um alles auf ein anderes Gerät zu holen.</p>
      <Button variant="primary" onClick={start} disabled={busy} className="flex-none">
        <SyncIcon className="size-4" /> Code erzeugen
      </Button>
    </div>
  );
};

export default NotesSync;
