import { Link } from "react-router-dom";
import { cn } from "../../shared/utils/cn";
import Liquid from "../ui/Liquid";
import { BLOCK_ICONS } from "./blockIcons";

// ─────────────────────────────────────────────────────────────
// Общая карточка блока «Start»: шапка (иконка + ПОДПИСЬ, справа aside) и содержимое.
// to — раздел, который открывает нажатие (в «Anpassen» ссылки нет: там нажатие открывает шторку блока).
// accent — шапка цветом акцента («Jetzt»). В «Glas» карточка — стекло библиотеки (Liquid)
// ─────────────────────────────────────────────────────────────
const BlockCard = ({ kind, title, accent = false, aside, to, editing = false, children }) => {
  const Icon = BLOCK_ICONS[kind];
  // в «Anpassen» сверху лежит панель блока — шапка опускается под неё
  const look = cn("flex h-full min-w-0 flex-col overflow-hidden rounded-card bg-card px-3.5 pb-3 text-left lg:px-4.5", editing ? "pt-6" : "pt-3.5 lg:pt-4");
  const link = to && !editing;

  return (
    <Liquid as={link ? Link : "div"} to={link ? to : undefined} refract press={link} className={look}>
      <header className={cn("flex items-center gap-1.5", accent ? "text-accent-ink" : "text-faint")}>
        <Icon className="size-3.5 shrink-0" strokeWidth={2.2} />
        <span className="min-w-0 flex-1 truncate text-small font-extrabold tracking-wide uppercase">{title}</span>
        {aside && <span className="shrink-0 text-caption font-extrabold text-ink">{aside}</span>}
      </header>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">{children}</div>
    </Liquid>
  );
};

export default BlockCard;
