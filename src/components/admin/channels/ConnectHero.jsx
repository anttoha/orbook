import { Megaphone, Send } from "lucide-react";
import Button from "../../ui/Button";

// Ещё нет группы (макет 27 handy-02). Бот на сервере не настроен — подсказка для владельца
const ConnectHero = ({ botConfigured, onConnect }) => (
  <section className="flex flex-col items-center gap-1.5 rounded-card bg-card px-4.5 pt-5.5 pb-4.5 text-center">
    <span className="mb-2 grid size-13 place-items-center rounded-full bg-tint text-accent-ink">
      <Megaphone className="size-6" aria-hidden="true" />
    </span>
    <h2 className="text-subhead font-black text-ink">{botConfigured ? "Noch keine Gruppe" : "Telegram-Bot fehlt"}</h2>
    <p className="max-w-80 text-body-sm text-muted">
      {botConfigured ? "Neuer Plan und „Für morgen“ direkt in die Telegram-Gruppe." : "Einmal auf dem Server einrichten: orbook telegram-token"}
    </p>
    {botConfigured && (
      <Button variant="primary" className="mt-3 w-full flex-none" onClick={onConnect}>
        <Send className="size-4" /> Telegram verbinden
      </Button>
    )}
  </section>
);

export default ConnectHero;
