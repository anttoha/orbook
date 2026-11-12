import { ChevronDown, ChevronUp } from "lucide-react";
import { entryHint, newsDateLong } from "../../shared/utils/changelog";
import Badge from "../ui/Badge";
import ChangeGroups from "./ChangeGroups";
import NewsPicture from "./NewsPicture";

// Одна версия в списке «Neuigkeiten»: свёрнута — дата и число изменений, открыта — все группы
const EntryCard = ({ entry, open, isNew, onToggle }) => {
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <li className="rounded-card bg-card">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 rounded-card px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2.5 text-body font-extrabold text-ink">
            Version {entry.version}
            {isNew && <Badge variant="live">Neu</Badge>}
          </span>
          <span className="block text-caption text-faint">{open ? newsDateLong(entry.date) : entryHint(entry)}</span>
        </span>
        <Chevron className="size-4 shrink-0 text-faint2" />
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-hair px-4 py-4">
          <NewsPicture name={entry.picture} />
          <ChangeGroups entry={entry} />
        </div>
      )}
    </li>
  );
};

export default EntryCard;
