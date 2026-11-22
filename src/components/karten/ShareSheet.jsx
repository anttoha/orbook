import { useEffect, useState } from "react";
import { Copy, Share } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { QR_MAX, encodeDeck, shareLink } from "../../shared/utils/kartenShare";
import { copyText } from "../../shared/utils/share";
import Button from "../ui/Button";
import QrCode from "../ui/QrCode";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// «Stapel teilen» (макет 43 handy-11): QR и ссылка. Карточки лежат в самой ссылке после «#» —
// сервер ORBook их не видит. Большая стопка не влезает в QR — тогда только ссылка.
// ─────────────────────────────────────────────────────────────
const ShareSheet = ({ open, onClose, deck }) => {
  const t = useT();
  const link = useShareLink(open ? deck : null);
  const share = async () => {
    try {
      await navigator.share({ title: deck.name, url: link });
    } catch (e) {
      if (e.name !== "AbortError") copyText(link);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow={translate("{name} · {n} Karten", { name: deck.name, n: deck.cards.length })} title={translate("Stapel teilen")}>
      <div className="flex flex-col gap-5">
        {link && link.length <= QR_MAX && <QrCode value={link} label={t("QR-Code zum Stapel")} className="size-50 self-center motion-safe:animate-pop-in" />}
        {link && link.length > QR_MAX && <p className="rounded-field bg-sand px-4 py-3 text-body-sm text-muted">{t("Zu groß für QR – teile den Link.")}</p>}
        <p className="truncate rounded-field bg-card px-4 py-3.5 text-body-sm text-muted select-all">{link ?? "…"}</p>
        <div className="flex gap-2">
          <Button onClick={() => copyText(link)} disabled={!link}>
            <Copy className="size-4" /> {t("Link kopieren")}
          </Button>
          {typeof navigator.share === "function" && (
            <Button variant="primary" onClick={share} disabled={!link}>
              <Share className="size-4" /> {t("Teilen")}
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
};

// Ссылка считается асинхронно (сжатие в браузере). deck = null — шторка закрыта, ничего не считаем
function useShareLink(deck) {
  const [state, setState] = useState({ deck: null, link: null });
  useEffect(() => {
    if (!deck) return undefined;
    let alive = true; // шторку закрыли или стопка поменялась — старый ответ не нужен
    encodeDeck(deck).then((code) => alive && setState({ deck, link: shareLink(window.location.origin, code) }));
    return () => {
      alive = false;
    };
  }, [deck]);
  return state.deck === deck ? state.link : null;
}

export default ShareSheet;
