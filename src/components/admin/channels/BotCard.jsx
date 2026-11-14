import { Send } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import Badge from "../../ui/Badge";
import Switch from "../../ui/Switch";

// Личный бот (макет 27b handy-04): работает ли бот, «Persönlicher Bot erlauben», сколько чатов — без имён
const BotCard = ({ username, configured, enabled, chats, onToggle }) => (
  <>
    <div className={cn("flex items-center gap-3 rounded-card px-3.5 py-3", configured ? "bg-ok-tint" : "bg-sand")}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card">
        <Send className={configured ? "size-4.5 text-ok" : "size-4.5 text-muted"} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className={configured ? "text-row font-extrabold text-ok" : "text-row font-extrabold text-muted"}>
          {configured ? `Bot @${username ?? "ORBook"} läuft` : "Telegram-Bot fehlt"}
        </p>
        <p className="truncate text-caption text-muted">{configured ? `${chats ?? 0} Chats verbunden` : "Einmal auf dem Server einrichten: orbook telegram-token"}</p>
      </div>
    </div>
    <section className="flex flex-col gap-2.5">
      <h2 className="flex items-center gap-2 text-hint font-extrabold text-faint">
        Persönlicher Bot <Badge>Neu</Badge>
      </h2>
      <div className="divide-y divide-hair rounded-card bg-card px-3.5">
        <div className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-row text-ink">Persönlicher Bot erlauben</p>
            <p className="text-caption text-faint">Jeder verbindet sich selbst in „Mitteilungen“</p>
          </div>
          <Switch checked={enabled} onChange={onToggle} label="Persönlicher Bot erlauben" />
        </div>
        <div className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-row text-ink">Verbundene Chats</p>
          </div>
          <span className="text-subhead font-black text-ink">{chats ?? 0}</span>
        </div>
      </div>
      <p className="text-caption text-faint">Was und wann, wählt jeder im Bot selbst.</p>
    </section>
  </>
);

export default BotCard;
