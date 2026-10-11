import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "lucide-react";
import WeekPicker from "../WeekPicker";

// ─────────────────────────────────────────────────────────────
// Кнопка 📅 + випадаючий календар «Woche wählen» (ПК, макет «Woche wählen (Dropdown)»).
// monday — показаний тиждень; onPick(понеділок) — вибрали тиждень
// ─────────────────────────────────────────────────────────────
const WeekPickerPopover = ({ monday, onPick, buttonClassName }) => {
  const [open, setOpen] = useState(false); // чи відкритий календар

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" aria-label="Woche wählen" className={buttonClassName}>
          <Calendar className="size-4.25" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="center"
          sideOffset={8}
          collisionPadding={16} // не вилазити за край екрана
          className="z-50 flex w-[360px] flex-col gap-4 rounded-[24px] bg-card p-4.5 shadow-2xl shadow-ink/15 outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
        >
          {/* key — при кожному відкритті календар починається з показаного тижня */}
          <WeekPicker
            key={monday}
            initialWeek={monday}
            onOpenWeek={(picked) => {
              onPick(picked); // переходимо на тиждень
              setOpen(false); // і закриваємо календар
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default WeekPickerPopover;
