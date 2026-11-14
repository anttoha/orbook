import { Copy, Lock, Maximize } from "lucide-react";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { cn } from "../../shared/utils/cn";
import { inviteMessage, shortUrl } from "../../shared/utils/invite";
import { copyText, whatsappUrl } from "../../shared/utils/share";
import Button from "../ui/Button";
import { WhatsappIcon } from "../ui/icons";
import QrCode from "../ui/QrCode";
import Liquid from "../ui/Liquid";

// Скелет, поки посилання вантажиться (макет handy-07)
export const InviteCardSkeleton = () => (
  <Liquid as="div" refract press={false} className="flex flex-col items-center gap-3 rounded-card bg-card p-4">
    <div className="size-42 animate-pulse rounded-field bg-skeleton" />
    <div className="h-3.25 w-50 animate-pulse rounded-full bg-skeleton" />
  </Liquid>
);

// ─────────────────────────────────────────────────────────────
// QR + посилання + «Kopieren» / «WhatsApp» (макети 16-einladen handy-02, handy-09, pc-02, pc-08).
// Спільна для адміна й учня. Телефон — усе стовпчиком; ПК — QR ліворуч, посилання й кнопки праворуч.
//   url       — повна адреса запрошення
//   off       — посилання вимкнене: QR блідий, кнопки неактивні (handy-06)
//   onBig     — «QR groß zeigen» кнопкою (учень і ПК); адмін на телефоні має окремий рядок
// ─────────────────────────────────────────────────────────────
const InviteCard = ({ url, className, off = false, onBig, caption = "Mit der Handy-Kamera scannen oder Link senden" }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const short = shortUrl(url);

  const qr = (
    <div className="relative grid shrink-0 place-items-center">
      <QrCode value={url} dim={off} className="size-42 lg:size-50" />
      {off && (
        <span className="absolute flex items-center gap-1.5 rounded-full bg-sand px-3.5 py-1.5 text-label font-extrabold text-muted">
          <Lock className="size-4" /> Link ist aus
        </span>
      )}
    </div>
  );

  const buttons = (
    <div className={cn("flex gap-2", off && "pointer-events-none opacity-40")} aria-disabled={off || undefined}>
      <Button onClick={() => copyText(url)} disabled={off}>
        <Copy className="size-4" /> Kopieren
      </Button>
      <Button variant="primary" href={whatsappUrl(inviteMessage(url, className))} target="_blank" rel="noreferrer">
        <WhatsappIcon className="size-4" /> {isDesktop ? "WhatsApp Web" : "WhatsApp"}
      </Button>
    </div>
  );

  const big = onBig && (
    <Button onClick={onBig} disabled={off} className="flex-none">
      <Maximize className="size-4" /> QR groß zeigen
    </Button>
  );

  if (isDesktop) {
    return (
      <div className="flex gap-5">
        <Liquid as="div" refract press={false} className="rounded-card bg-card p-4.5">{qr}</Liquid>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="text-hint font-extrabold text-faint">Einladungslink</p>
          <p className={cn("-mt-1.5 truncate rounded-field bg-card px-4 py-3.5 text-body-sm font-extrabold", off ? "text-faint" : "text-accent-ink")}>{short}</p>
          <p className="-mt-1 text-caption text-faint">{off ? "Niemand kommt mehr über diesen Link rein." : "Scannen oder Link in die Klassengruppe senden."}</p>
          {buttons}
          {big}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Liquid as="div" refract press={false} className="flex flex-col items-center gap-2 rounded-card bg-card px-4 pt-4 pb-4.5 text-center">
        {qr}
        <p className={cn("mt-2 break-all text-body-sm font-extrabold", off ? "text-faint" : "text-accent-ink")}>{short}</p>
        <p className="text-caption text-faint">{off ? "Niemand kommt mehr über diesen Link rein." : caption}</p>
      </Liquid>
      {buttons}
      {big}
    </div>
  );
};

export default InviteCard;
