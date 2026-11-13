import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSheet } from "../../shared/hooks/useSheet";
import { useTelegramStore } from "../../shared/store/telegramStore";
import { botUrl, telegramState } from "../../shared/utils/telegram";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

// Карточка «Telegram» в Mitteilungen (макет 27b handy-01/03):
// не подключено — «Mit Telegram verbinden» (шторка ?sheet=telegram), подключено — «Bot öffnen» и «Trennen».
const TelegramCard = () => {
  const status = useTelegramStore((s) => s.status);
  const load = useTelegramStore((s) => s.load);
  const disconnect = useTelegramStore((s) => s.disconnect);
  const { openSheet } = useSheet();
  const [busy, setBusy] = useState(false);
  const state = telegramState(status);

  useEffect(() => {
    load();
  }, [load]);

  if (state === "hidden") return null;

  const unlink = async () => {
    setBusy(true);
    try {
      await disconnect();
      toast.success("Telegram getrennt");
    } catch (error) {
      toast.error(error?.message || "Hat nicht geklappt");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="flex items-center gap-2 text-hint font-extrabold text-faint">
        Telegram <Badge>Neu</Badge>
      </h2>
      <div className="flex flex-col gap-3 rounded-card bg-card p-2">
        {state === "on" ? (
          <div className="flex items-center gap-3 rounded-field bg-ok-tint px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card">
              <Send className="size-4.5 text-ok" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-row font-extrabold text-ok">Telegram · verbunden</p>
              <p className="text-caption text-muted">Was kommt, stellst du im Bot ein.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 pt-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tint">
              <Send className="size-4.5 text-accent-ink" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-row font-extrabold text-ink">Lieber per Telegram?</p>
              <p className="text-caption text-muted">Dasselbe als Nachricht vom ORBook-Bot.</p>
            </div>
          </div>
        )}
        <div className="flex gap-2.5 px-1.5 pb-1.5">
          {state === "on" ? (
            <>
              <Button href={botUrl(status?.botUsername)} target="_blank" rel="noreferrer" className="flex-1">
                <Send className="size-4" /> Bot öffnen
              </Button>
              <Button onClick={unlink} disabled={busy} className="flex-1 text-danger">
                Trennen
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => openSheet("telegram")} className="flex-1">
              <Send className="size-4" /> Mit Telegram verbinden
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TelegramCard;
