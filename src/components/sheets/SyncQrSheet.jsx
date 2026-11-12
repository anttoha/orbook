import { useSyncStore } from "../../shared/store/syncStore";
import { codeLink } from "../../shared/utils/linkCode";
import { OwnDevicesOnly } from "../sync/SyncQr";
import Button from "../ui/Button";
import QrCode from "../ui/QrCode";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// «Sync-Code als QR» (макет 25 handy-08): второй телефон сканирует обычной камерой,
// открывается ORBook и спрашивает «Gerät verbinden?». Адрес: ?sheet=syncqr
// ─────────────────────────────────────────────────────────────
const SyncQrSheet = ({ open, onClose }) => {
  const code = useSyncStore((s) => s.code);
  return (
    <Sheet open={open} onClose={onClose} desktop="qr" eyebrow="Nur für deine Geräte" title="Sync-Code als QR">
      {code ? (
        <div className="flex flex-col items-center rounded-panel bg-card px-4 pt-5.5 pb-6 text-center">
          <QrCode value={codeLink("sync", code, window.location.origin)} label="QR-Code mit deinem Sync-Code" className="size-52 motion-safe:animate-pop-in" />
          <p className="mt-6 text-row font-black tracking-code text-ink">{code}</p>
          <p className="mt-2 text-label text-faint">Mit der Kamera des anderen Handys scannen</p>
        </div>
      ) : (
        <p className="text-body-sm text-muted">Noch kein Sync-Code auf diesem Gerät.</p>
      )}
      <OwnDevicesOnly className="flex gap-2.5 rounded-field bg-sand px-3.25 py-3 text-label text-muted" />
      <Button onClick={onClose} className="flex-none">
        Fertig
      </Button>
    </Sheet>
  );
};

export default SyncQrSheet;
