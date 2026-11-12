import * as Popover from "@radix-ui/react-popover";
import { useExamFilterDraft } from "../../shared/hooks/useExamFilterDraft";
import { cn } from "../../shared/utils/cn";
import { EMPTY_FILTER } from "../../shared/utils/exams";
import Button from "../ui/Button";
import { FilterIcon } from "../ui/icons";
import Kbd from "../ui/Kbd";
import ExamFilterFields from "./ExamFilterFields";

// ─────────────────────────────────────────────────────────────
// Кнопка фільтра + випадне вікно під нею (ПК, макет 16 «Klausuren · Filter»).
// open / onOpenChange — ззовні, бо клавіша F відкриває вікно зі сторінки.
// active — у фільтрі щось вибрано: кнопка підсвічена
// ─────────────────────────────────────────────────────────────
const ExamFilterPopover = ({ open, onOpenChange, active }) => {
  const { draft, change, setDraft, apply, count, pastLoading } = useExamFilterDraft(open);

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Filter"
          className={cn("grid size-9.5 shrink-0 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/50", active ? "bg-tint text-accent-ink" : "bg-card text-ink hover:bg-sand")}
        >
          <FilterIcon className="size-4.25" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          collisionPadding={16} // не вилазити за край екрана
          className="z-50 flex max-h-[calc(100dvh-2rem)] w-filter flex-col gap-4 overflow-y-auto scroll-stable rounded-box bg-card p-4.5 shadow-sheet shadow-ink/15 outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
        >
          <header className="flex items-center justify-between">
            <h2 className="text-number text-ink">Filter</h2>
            <Kbd>F</Kbd>
          </header>
          <ExamFilterFields draft={draft} change={change} />
          <div className="flex gap-2.5">
            <Button onClick={() => setDraft(EMPTY_FILTER)}>Zurücksetzen</Button>
            <Button
              variant="primary"
              onClick={() => {
                apply();
                onOpenChange(false);
              }}
            >
              {pastLoading ? "Anzeigen" : `${count} anzeigen`}
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ExamFilterPopover;
