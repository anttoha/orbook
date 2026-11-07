import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DESKTOP_QUERY, useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { abLetter } from "../../../shared/utils/muster";
import WeekLetter from "../../muster/WeekLetter";
import Sheet from "../../ui/Sheet";

// Як зараз рахуються тижні (muster.abMode) — підпис під «Diese Woche · KW 45»
const MODE_TEXT = { school: "Laut Plan der Schule", swap: "A und B getauscht", none: "Keine Wochen A und B" };

// ─────────────────────────────────────────────────────────────
// «Diese Woche · KW 45 · WOCHE A» (макет 19b): натиснули → вибір «Woche A oder B?».
// Телефон — рядок-кнопка і шторка знизу (handy-05); ПК — картка «Wochen A und B» з «Ändern» і випадним вікном (pc-02).
// children — сам вибір (AbChoice)
// ─────────────────────────────────────────────────────────────
const AbSwitch = ({ kw, data, children }) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [open, setOpen] = useState(false);
  const letter = abLetter(data.abWeek);
  const summary = (
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2 text-row text-ink">
        Diese Woche · KW {kw} <WeekLetter letter={letter} />
      </span>
      <span className="block text-caption text-faint">{MODE_TEXT[data.abMode]}</span>
    </span>
  );

  if (!isDesktop) {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-card bg-card px-3.5 py-3 text-left">
          {summary}
          <ChevronRight className="size-4 shrink-0 text-faint2" />
        </button>
        <Sheet open={open} onClose={() => setOpen(false)} eyebrow="Muster · Woche A und B" title="Woche A oder B?">
          {children}
        </Sheet>
      </>
    );
  }

  return (
    <div className="rounded-card bg-card px-5 py-4.5">
      <p className="mb-2 text-hint font-extrabold text-faint">Wochen A und B</p>
      <div className="flex items-center gap-3">
        {summary}
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger className="flex h-8 items-center gap-1.5 rounded-full border border-rule px-3.5 text-label font-extrabold text-ink outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-accent/50">
            Ändern <ChevronDown className="size-3.5 text-faint" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content align="end" sideOffset={6} collisionPadding={16} className="z-50 w-filter rounded-card bg-card p-3 shadow-sheet outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in">
              {children}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
};

export default AbSwitch;
