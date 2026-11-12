import Badge from "../../ui/Badge";
import OrbitMark from "../../ui/OrbitMark";
import { Skeleton } from "../../ui/PlanState";

// Сообщение бота в группе (макет 27 «So sieht es aus»): песочная карточка, как пример в Mitteilungen
const MessageBubble = ({ text, loading }) => (
  <div className="flex gap-3 rounded-card bg-sand px-3.5 py-3.5">
    <OrbitMark className="mt-0.5 size-7.5 shrink-0" />
    <div className="min-w-0 flex-1 text-body-sm text-ink">
      <p className="flex items-center gap-2 font-extrabold">
        ORBook <Badge variant="changed">Bot</Badge>
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-20 rounded-field" />
      ) : (
        // переносы строк — как в Telegram; первая строка — заголовок
        <p className="mt-1 whitespace-pre-line break-words first-line:font-extrabold motion-safe:animate-fade-in">{text ?? "Noch nichts zu zeigen."}</p>
      )}
    </div>
  </div>
);

export default MessageBubble;
