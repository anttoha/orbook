import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BookOpen, Plus, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassButton, GlassMenu } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { useSheet } from "../../shared/hooks/useSheet";
import { cn } from "../../shared/utils/cn";
import { menuContentClass, menuIconClass, menuItemClass } from "../ui/menuStyles";

const round = "grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-90";
const pill = "ml-0.5 flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-row font-bold text-on-accent outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-96";

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

  const glass = useGlass();

  // «Glas» (часть 30a): кнопка и меню библиотеки liquid-glass
  if (glass) {
    if (!classTarget) {
      return (
        <GlassButton variant="filled" tint="var(--color-accent)" size={wide ? "lg" : "md"} icon={<Plus className="size-4.25" />} aria-label="Eigene Aufgabe" onClick={own}>
          {wide ? "Eigene Aufgabe" : undefined}
        </GlassButton>
      );
    }
    return (
      <GlassMenu
        icon={<Plus className="size-4.25" />}
        aria-label="Aufgabe hinzufügen"
        items={[
          { label: "Eigene Aufgabe", icon: <UserRound className="size-4.5" />, onSelect: own },
          { label: "Hausaufgabe für die Klasse", icon: <BookOpen className="size-4.5" />, onSelect: () => navigate(classTarget) },
        ]}
      />
    );
  }

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
