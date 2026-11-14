import { useSyncStore } from "../../shared/store/syncStore";
import { codeLink } from "../../shared/utils/linkCode";
import { LockIcon } from "../ui/icons";
import QrCode from "../ui/QrCode";
import Liquid from "../ui/Liquid";

// Подсказка под QR: код = доступ к твоим данным
export const OwnDevicesOnly = ({ className }) => (
  <p className={className}>
    <LockIcon className="mt-0.5 size-4 shrink-0" />
    <span>Nur deinen eigenen Geräten zeigen — wer den QR scannt, sieht deine Notizen.</span>
  </p>
);

// ─────────────────────────────────────────────────────────────
// QR на ПК (макет 25 pc-02): главный путь «ПК → телефон», поэтому виден сразу, под кодом.
// На телефоне его нет — там кнопка «QR» в карточке кода открывает шторку
// ─────────────────────────────────────────────────────────────
export const SyncQrCard = () => {
  const code = useSyncStore((s) => s.code);
  if (!code) return null;
  return (
    <Liquid as="div" refract press={false} className="hidden items-center gap-5 rounded-card bg-card p-4 motion-safe:animate-rise-in lg:flex">
      <QrCode value={codeLink("sync", code, window.location.origin)} label="QR-Code mit deinem Sync-Code" className="size-40 shrink-0" />
      <div className="min-w-0">
        <p className="text-hint font-extrabold text-faint">Aufs Handy holen</p>
        <p className="mt-2 text-row font-extrabold text-ink">Mit der Handy-Kamera scannen</p>
        <p className="mt-1 text-label text-faint">ORBook öffnet sich und fragt kurz nach.</p>
        <OwnDevicesOnly className="mt-3 flex gap-2 rounded-field bg-sand px-3 py-2.5 text-label text-muted" />
      </div>
    </Liquid>
  );
};
