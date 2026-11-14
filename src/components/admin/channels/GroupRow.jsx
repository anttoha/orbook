import { ChevronDown, Megaphone } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import Liquid from "../../ui/Liquid";

// «Gruppe der Klasse — zusätzlich, optional» (макет 27b handy-04): одна строка; нажал — открывается
// прежний экран группы из части 27 прямо под ней
const GroupRow = ({ group, open, onToggle }) => (
  <section className="flex flex-col gap-2.5">
    <h2 className="flex items-baseline justify-between gap-3 text-hint font-extrabold text-faint">
      Gruppe der Klasse <span className="text-caption font-normal">zusätzlich, optional</span>
    </h2>
    <Liquid as="button" refract type="button" onClick={onToggle} aria-expanded={open} className="flex items-center gap-3 rounded-card bg-card px-3.5 py-3 text-left">
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", group ? "bg-ok-tint text-ok" : "bg-tint text-accent-ink")}>
        <Megaphone className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-row font-extrabold text-ink">{group ? `Gruppe „${group.title ?? "Telegram"}“` : "Gruppe verbinden"}</span>
        <span className="block truncate text-caption text-faint">{group ? "verbunden · Neuer Plan, Für morgen" : "Auch in die Telegram-Gruppe posten"}</span>
      </span>
      <ChevronDown className={cn("size-4.5 shrink-0 text-faint transition-transform", open && "rotate-180")} aria-hidden="true" />
    </Liquid>
  </section>
);

export default GroupRow;
