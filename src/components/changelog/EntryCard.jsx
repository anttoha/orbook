import { ChevronDown } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { entryHint, newsDateLong } from "../../shared/utils/changelog";
import Badge from "../ui/Badge";
import ChangeGroups from "./ChangeGroups";
import NewsPicture from "./NewsPicture";
import Liquid from "../ui/Liquid";

// Одна версия в списке «Neuigkeiten»: свёрнута — дата и число изменений, открыта — все группы.
// index — место в списке: карточки выплывают по очереди.
const EntryCard = ({ entry, open, isNew, index, onToggle }) => (
  <Liquid as="li" refract press={false} className="rounded-card bg-card motion-safe:animate-rise-in" style={{ animationDelay: `${index * 70}ms` }}>
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 rounded-card px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2.5 text-body font-extrabold text-ink">
          Version {entry.version}
          {isNew && <Badge variant="live" className="motion-safe:animate-badge-pop">Neu</Badge>}
        </span>
        <span className="block text-caption text-faint">{open ? newsDateLong(entry.date) : entryHint(entry)}</span>
      </span>
      <ChevronDown className={cn("size-4 shrink-0 text-faint2 transition-transform duration-300 ease-soft motion-reduce:transition-none", open && "rotate-180")} />
    </button>
    {/* Раскрытие без скачка: высота плавно идёт от 0fr до 1fr. Закрытое содержимое прячем от Tab и скринридера (inert) */}
    <div className={cn("grid transition-[grid-template-rows] duration-350 ease-soft motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")} inert={!open}>
      <div className="overflow-hidden">
        <div className="flex flex-col gap-4 border-t border-hair px-4 py-4">
          <NewsPicture name={entry.picture} />
          <ChangeGroups entry={entry} delay={index === 0 ? 350 : 0} />
        </div>
      </div>
    </div>
  </Liquid>
);

export default EntryCard;
