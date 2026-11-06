import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { menuContentClass, menuIconClass, menuItemClass, menuSeparatorClass } from "../ui/menuStyles";
import { codeActions } from "./codeActions";

// Кнопка «⋮» у рядку коду.
// ПК: випадаюче меню (макет 45). Телефон (onOpenSheet): кнопка відкриває шторку (макет 43)
const CodeMenu = ({ code, onAction, onOpenSheet }) => {
  const button = (props) => (
    <button type="button" aria-label={`Aktionen für ${code.label}`} className="grid size-8 shrink-0 place-items-center rounded-full text-ink outline-none hover:bg-sand focus-visible:ring-2 focus-visible:ring-accent/50 data-[state=open]:bg-sand" {...props}>
      <MoreVertical className="size-4.5" />
    </button>
  );
  if (onOpenSheet) return button({ onClick: onOpenSheet });

  const items = codeActions(code);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{button()}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className={menuContentClass}>
          {items.map((item) => (
            <div key={item.kind}>
              {item.danger && <DropdownMenu.Separator className={menuSeparatorClass} />}
              <DropdownMenu.Item className={cn(menuItemClass, "font-semibold", item.danger && "text-danger")} onSelect={() => onAction(item.kind, code)}>
                <item.icon className={cn(menuIconClass, item.danger && "text-danger")} /> {item.label}
              </DropdownMenu.Item>
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default CodeMenu;
