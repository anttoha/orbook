import QrCode from "../ui/QrCode";
import { useT } from "../../shared/hooks/useT";

// ПК (макет pc-01): QR той же webcal-ссылки — навёл камеру телефона и добавил абонемент там
const FeedQr = ({ webcalUrl }) => {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-1 rounded-card bg-card px-4 pt-5 pb-4 text-center">
      <QrCode value={webcalUrl} className="mb-3 size-44" label={t("QR-Code zum Kalender-Abo")} />
      <p className="text-row font-extrabold text-ink">{t("Mit dem Handy scannen")}</p>
      <p className="text-body-sm text-muted">{t("und im Kalender dort hinzufügen")}</p>
      <p className="mt-2 w-full truncate text-caption font-bold text-faint">{webcalUrl}</p>
    </div>
  );
};

export default FeedQr;
