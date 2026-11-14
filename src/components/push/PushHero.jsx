import { cn } from "../../shared/utils/cn";
import Liquid from "../ui/Liquid";

// Большая карточка вверху, когда Mitteilungen ещё не работают: «aus», iPhone, «blockiert», «geht nicht».
// tone="tint" — можно включить (сиреневый круг), "sand" — сначала надо что-то сделать в браузере
const PushHero = ({ icon: Icon, title, text, tone = "tint", children, foot }) => (
  <Liquid as="section" refract press={false} className="flex flex-col items-center gap-1.5 rounded-card bg-card px-4.5 pt-5.5 pb-4.5 text-center">
    <span className={cn("mb-2 grid size-13 place-items-center rounded-full", tone === "tint" ? "bg-tint text-accent-ink" : "bg-sand text-muted")}>
      <Icon className="size-6" aria-hidden="true" />
    </span>
    <h2 className="text-subhead font-black text-ink">{title}</h2>
    <p className="max-w-80 text-body-sm text-muted">{text}</p>
    {children && <div className="mt-3 flex w-full flex-col">{children}</div>}
    {foot && <p className="mt-1.5 text-caption text-faint">{foot}</p>}
  </Liquid>
);

export default PushHero;
