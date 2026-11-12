import { useSyncStore } from "../../shared/store/syncStore";
import { codeLink } from "../../shared/utils/linkCode";
import { LockIcon } from "../ui/icons";
import QrCode from "../ui/QrCode";

// Подсказка под QR: код = доступ к твоим данным
export const OwnDevicesOnly = ({ className }) => (
  <p className={className}>
    <LockIcon className="mt-0.5 size-4 shrink-0" />
    <span>Nur deinen eigenen Geräten zeigen — wer den QR scannt, sieht deine Notizen.</span>
  </p>
);

// ─────────────────────────────────────────────────────────────
// QR справа на ПК (макет 25 pc-02): главный путь «ПК → телефон», поэтому виден сразу.
// ─────────────────────────────────────────────────────────────
export const SyncQrCard = () => {
  const code = useSyncStore((s) => s.code);
  if (!code) return null;
  return (
    <aside className="hidden w-86 shrink-0 flex-col items-center rounded-panel bg-card px-5.5 pt-5.5 pb-5.5 text-center lg:flex">
      <p className="self-start text-hint font-extrabold text-faint">Aufs Handy holen</p>
      <QrCode value={codeLink("sync", code, window.location.origin)} label="QR-Code mit deinem Sync-Code" className="mt-4 size-60" />
      <p className="mt-5 text-row font-extrabold text-ink">Mit der Handy-Kamera scannen</p>
      <p className="mt-1 text-label text-faint">ORBook öffnet sich und fragt kurz nach.</p>
      <OwnDevicesOnly className="mt-5 flex gap-2 rounded-field bg-sand px-3.25 py-2.5 text-left text-label text-muted" />
    </aside>
  );
};
