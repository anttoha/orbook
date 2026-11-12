import { cn } from "../../shared/utils/cn";

// Точка «Live» (часть 26): зелёная с мягко расходящимся ореолом — связь есть, план придёт сам.
// Пустое кольцо — связи нет, приложение спрашивает раз в минуту. size: "sm" (строки) | "md" (карточка)
const LiveDot = ({ on, size = "sm", className }) => (
  <span aria-hidden="true" className={cn("relative inline-grid shrink-0 place-items-center", size === "md" ? "size-3" : "size-2", className)}>
    {on && <span className="absolute inset-0 rounded-full bg-ok opacity-40 motion-safe:animate-live-halo" />}
    <span className={cn("relative size-full rounded-full transition-colors duration-500", on ? "bg-ok" : "border-[1.5px] border-faint")} />
  </span>
);

export default LiveDot;
