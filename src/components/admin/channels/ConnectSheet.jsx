import { Check, LoaderCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { loadChannels, telegramLink } from "../../../shared/api/admin";
import { groupLine } from "../../../shared/utils/channels";
import { cn } from "../../../shared/utils/cn";
import Button from "../../ui/Button";
import Sheet from "../../ui/Sheet";

// «Telegram verbinden» (макет 27 handy-03/04): ссылка t.me/…?startgroup=код → выбрать группу →
// сервер видит код и подключается сам. Пока шторка открыта, спрашиваем статус раз в 3 секунды
const ConnectSheet = ({ open, onClose, onConnected }) => (
  <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow="Kanäle" title="Telegram verbinden">
    {open && <ConnectBody onClose={onClose} onConnected={onConnected} />}
  </Sheet>
);

const ConnectBody = ({ onClose, onConnected }) => {
  const [link, setLink] = useState({ status: "loading", url: null, bot: null, error: null });
  const [group, setGroup] = useState(null); // подключилась — показываем «Fertig»

  // Новая ссылка при каждом открытии (старый код сразу недействителен)
  useEffect(() => {
    let alive = true;
    telegramLink()
      .then((r) => alive && setLink({ status: "ready", url: r.link, bot: r.link.split("/")[3]?.split("?")[0], error: null }))
      .catch((error) => alive && setLink({ status: "error", url: null, bot: null, error }));
    return () => {
      alive = false;
    };
  }, []);

  // Ждём, пока Telegram пришлёт код (сервер подключит группу сам)
  useEffect(() => {
    if (link.status !== "ready" || group) return undefined;
    const startedAt = Date.now();
    const timer = setInterval(async () => {
      try {
        const data = await loadChannels();
        const fresh = data.group && !data.group.error && new Date(data.group.connectedAt).getTime() >= startedAt - 60_000;
        if (fresh) {
          setGroup(data.group);
          onConnected(data);
        }
      } catch {
        // сеть мигнула — спросим через 3 секунды ещё раз
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [link.status, group, onConnected]);

  if (link.status === "error") {
    const missing = link.error?.code === "telegram_missing";
    return (
      <p className="rounded-field bg-danger-tint px-3.5 py-3 text-label font-bold text-ink">
        {missing ? "Der Telegram-Bot ist auf dem Server noch nicht eingerichtet." : link.error?.message}
      </p>
    );
  }

  const done = Boolean(group);
  return (
    <>
      <Step n={1} done={done} title="Telegram öffnen" text={link.bot ? `Der Bot @${link.bot}` : "…"}>
        {!done && (
          <Button variant="primary" className="flex-none" href={link.url ?? undefined} target="_blank" rel="noreferrer" disabled={!link.url}>
            <Send className="size-4" /> In Telegram öffnen
          </Button>
        )}
      </Step>
      <Step n={2} done={done} title="Gruppe der Klasse wählen" text="Telegram fügt den Bot hinzu" />
      <Step n={3} done={done} title="Fertig" text="ORBook verbindet sich selbst">
        {done ? (
          <p className="flex items-center gap-3 rounded-field bg-ok-tint px-3.5 py-3 text-row font-extrabold text-ink motion-safe:animate-fade-in">
            <Check className="size-4.5 text-ok" /> {groupLine(group)}
          </p>
        ) : (
          <p className="flex items-center gap-3 rounded-field bg-sand px-3.5 py-3 text-label font-bold text-muted">
            <LoaderCircle className="size-4.5 animate-spin text-accent-ink" /> Warte auf Telegram …
          </p>
        )}
      </Step>
      {done ? (
        <Button variant="primary" className="flex-none" onClick={onClose}>
          Fertig
        </Button>
      ) : (
        <p className="text-center text-caption text-faint">Der Link gilt 15 Minuten.</p>
      )}
    </>
  );
};

// Шаг: номер в круге (или галочка), заголовок, подпись и что-то под ними
export const Step = ({ n, done, title, text, children }) => (
  <div className="flex gap-3">
    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-label font-black", done ? "bg-ok-tint text-ok" : "bg-tint text-accent-ink")}>
      {done ? <Check className="size-4" /> : n}
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-2.5">
      <div>
        <p className="text-row font-extrabold text-ink">{title}</p>
        <p className="text-caption text-muted">{text}</p>
      </div>
      {children}
    </div>
  </div>
);

export default ConnectSheet;
