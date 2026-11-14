import { useState } from "react";
import { Search } from "lucide-react";
import { GlassButton } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { useHotkeys } from "../../shared/hooks/useHotkeys";
import { cn } from "../../shared/utils/cn";
import Kbd from "../ui/Kbd";
import SearchPalette from "./SearchPalette";

// ─────────────────────────────────────────────────────────────
// «Suchen ⌘K» у сайдбарі. Виглядає як поле, але лише відкриває вікно пошуку посередині
// (SearchPalette, макет 51): там більше місця для груп і підказок.
// ⌘K / Ctrl+K — те саме з будь-якої сторінки.
// collapsed — сайдбар згорнутий: видно тільки лупу
// ─────────────────────────────────────────────────────────────
const QuickSearch = ({ collapsed }) => {
  const [open, setOpen] = useState(false); // чи відкрите вікно пошуку
  const glass = useGlass();

  useHotkeys({ "mod+k": () => setOpen(true) });

  // «Glas» (часть 30a): кнопка библиотеки во всю ширину, с лупой
  if (glass) {
    return (
      <>
        <GlassButton icon={<Search className="size-4" />} aria-label="Suchen" aria-haspopup="dialog" onClick={() => setOpen(true)} className="w-full shrink-0">
          {collapsed ? undefined : "Suchen"}
        </GlassButton>
        <SearchPalette open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Suchen"
        aria-haspopup="dialog"
        className="relative flex h-10 w-full shrink-0 items-center rounded-full bg-paper pl-10 text-left text-body text-faint outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" />
        {/* підпис і ⌘K ховаються разом із сайдбаром */}
        <span className={cn("truncate transition-opacity duration-300", collapsed ? "opacity-0" : "opacity-100 delay-150")}>Suchen</span>
        {!collapsed && <Kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">⌘K</Kbd>}
      </button>
      <SearchPalette open={open} onOpenChange={setOpen} />
    </>
  );
};

export default QuickSearch;
