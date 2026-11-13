import { LoaderCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { telegramLink } from "../../shared/api/telegram";
import { useTelegramStore } from "../../shared/store/telegramStore";
import { useUserStore } from "../../shared/store/userStore";
import { telegramCourses } from "../../shared/utils/telegram";
import { Step } from "../admin/channels/ConnectSheet";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// Шторка «Mit Telegram verbinden» (макет 27b handy-02). Адрес: ?sheet=telegram
// 1) одноразовая ссылка t.me/<bot>?start=… 2) «Starten» в Telegram. Пока открыта — статус раз в 3 с.
const TelegramSheet = ({ open, onClose }) => (
  <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow="Mitteilungen" title="Mit Telegram verbinden">
    {open && <ConnectBody onClose={onClose} />}
  </Sheet>
);

const ConnectBody = ({ onClose }) => {
  const picked = useUserStore((s) => s.picked);
  const load = useTelegramStore((s) => s.load);
  const [link, setLink] = useState({ status: "loading", url: null, error: null });

  // Новая ссылка при каждом открытии; курсы — как в «Meine Kurse» на этом устройстве
  useEffect(() => {
    let alive = true;
    telegramLink(telegramCourses(picked))
      .then((r) => alive && setLink({ status: "ready", url: r.link, error: null }))
      .catch((error) => alive && setLink({ status: "error", url: null, error }));
    return () => {
      alive = false;
    };
  }, [picked]);

  // Ждём «Starten» в Telegram: сервер привяжет чат сам
  useEffect(() => {
    if (link.status !== "ready") return undefined;
    const timer = setInterval(async () => {
      const status = await load();
      if (status?.connected) {
        toast.success("Telegram verbunden");
        onClose();
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [link.status, load, onClose]);

  if (link.status === "error") {
    return <p className="rounded-field bg-danger-tint px-3.5 py-3 text-label font-bold text-ink">{link.error?.message || "Hat nicht geklappt"}</p>;
  }

  const bot = link.url?.split("/")[3]?.split("?")[0];
  return (
    <>
      <Step n={1} title="Telegram öffnen" text={bot ? `Der Bot @${bot}` : "…"}>
        <Button variant="primary" className="flex-none" href={link.url ?? undefined} target="_blank" rel="noreferrer" disabled={!link.url}>
          <Send className="size-4" /> In Telegram öffnen
        </Button>
      </Step>
      <Step n={2} title="Unten auf „Starten“ tippen" text="Fertig – hier wird es grün">
        <p className="flex items-center gap-3 rounded-field bg-sand px-3.5 py-3 text-label font-bold text-muted">
          <LoaderCircle className="size-4.5 animate-spin text-accent-ink" /> Warte auf Telegram …
        </p>
      </Step>
      <p className="text-center text-caption text-faint">
        Der Link gilt 15 Minuten und nur für dich.
        <br />
        Anderes Handy? Schick dem Bot deinen <b className="font-extrabold text-muted">Zugangscode</b>.
      </p>
    </>
  );
};

export default TelegramSheet;
