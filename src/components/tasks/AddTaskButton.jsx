import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BookOpen, Plus, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSheet } from "../../shared/hooks/useSheet";
import { cn } from "../../shared/utils/cn";
import { menuContentClass, menuIconClass, menuItemClass } from "../ui/menuStyles";

const round = "grid size-9.5 shrink-0 place-items-center rounded-full bg-accent text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50";
const pill = "ml-0.5 flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-row font-bold text-on-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

// ─────────────────────────────────────────────────────────────
// «+» в Aufgaben (часть 25). У всех — своя задача (шторка «aufgabe»).
// Кто может записывать домашки классу (Editor-/Lehrer-Code, classTarget) — получает меню из двух пунктов.
// wide — кнопка с подписью на ПК, иначе круглая на телефоне
// ─────────────────────────────────────────────────────────────
const AddTaskButton = ({ classTarget, wide }) => {
  const { openSheet } = useSheet();
  const navigate = useNavigate();
  const own = () => openSheet("aufgabe");
  const look = wide ? pill : round;
  const inner = wide ? (
    <>
      <Plus className="size-4" /> Eigene Aufgabe
    </>
  ) : (
    <Plus className="size-4.25" />
  );

  if (!classTarget) {
    return (
      <button type="button" onClick={own} aria-label="Eigene Aufgabe" className={look}>
        {inner}
      </button>
    );
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger aria-label="Aufgabe hinzufügen" className={look}>
        {inner}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className={cn(menuContentClass)}>
          <DropdownMenu.Item onSelect={own} className={menuItemClass}>
            <UserRound className={menuIconClass} /> Eigene Aufgabe
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => navigate(classTarget)} className={menuItemClass}>
            <BookOpen className={menuIconClass} /> Hausaufgabe für die Klasse
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default AddTaskButton;
