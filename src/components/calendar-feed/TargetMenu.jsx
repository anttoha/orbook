import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { menuContentClass, menuItemClass } from "../ui/menuStyles";
import { TARGETS } from "./targets";
import { useT } from "../../shared/hooks/useT";

// ПК: «Zum Kalender» — выпадающее меню под кнопкой (макет pc-02), те же четыре варианта
const TargetMenu = ({ links, onCopy, children }) => {
  const t = useT();
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={8} className={menuContentClass}>
          {TARGETS.map((target) => {
            const Icon = target.icon;
            const text = (
              <>
                <Icon className="size-4.5 shrink-0 text-accent-ink" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block">{t(target.title)}</span>
                  <span className="block text-caption font-normal text-faint">{t(target.hint)}</span>
                </span>
              </>
            );
            if (target.key === "copy") {
              return (
                <DropdownMenu.Item key={target.key} onSelect={onCopy} className={menuItemClass}>
                  {text}
                </DropdownMenu.Item>
              );
            }
            return (
              <DropdownMenu.Item key={target.key} asChild className={menuItemClass}>
                <a href={links?.[target.key]} {...(target.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {text}
                </a>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default TargetMenu;
