import * as ContextMenu from "@radix-ui/react-context-menu";
import { Copy, ExternalLink, Pencil, Share } from "lucide-react";
import { useMaterialActions } from "../../shared/hooks/useMaterialActions";
import { cn } from "../../shared/utils/cn";
import Kbd from "../ui/Kbd";
import { TrashIcon } from "../ui/icons";
import { menuContentClass, menuIconClass, menuItemClass, menuSeparatorClass } from "../ui/menuStyles";
import DeleteMaterialDialog from "./DeleteMaterialDialog";

const Shortcut = ({ children }) => <Kbd className="ml-auto">{children}</Kbd>;

// ─────────────────────────────────────────────────────────────
// ПК: меню правої кнопки на рядку посилання (макет pc-02), як у уроку (LessonContextMenu).
// «Bearbeiten» і «Löschen» — лише якщо сервер дозволив (canEdit / canDelete).
// children — сам рядок (MaterialRow), він стає тригером меню.
// ─────────────────────────────────────────────────────────────
const MaterialMenu = ({ item, children }) => {
  const actions = useMaterialActions(item);

  // Клавіші у відкритому меню: E — Bearbeiten, Entf/⌫ — Löschen
  const handleKeyDown = (event) => {
    const action = { e: item.canEdit && actions.edit, delete: item.canDelete && actions.askDelete, backspace: item.canDelete && actions.askDelete }[event.key.toLowerCase()];
    if (!action) return;
    event.preventDefault();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); // закрити меню
    action();
  };

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={menuContentClass} onKeyDown={handleKeyDown}>
            <ContextMenu.Item className={menuItemClass} onSelect={actions.open}>
              <ExternalLink className={menuIconClass} /> Öffnen <Shortcut>↵</Shortcut>
            </ContextMenu.Item>
            <ContextMenu.Item className={menuItemClass} onSelect={actions.copy}>
              <Copy className={menuIconClass} /> Link kopieren
            </ContextMenu.Item>
            <ContextMenu.Item className={menuItemClass} onSelect={actions.share}>
              <Share className={menuIconClass} /> Teilen
            </ContextMenu.Item>
            {item.canEdit && (
              <ContextMenu.Item className={menuItemClass} onSelect={actions.edit}>
                <Pencil className={menuIconClass} /> Bearbeiten <Shortcut>E</Shortcut>
              </ContextMenu.Item>
            )}
            {item.canDelete && (
              <>
                <ContextMenu.Separator className={menuSeparatorClass} />
                <ContextMenu.Item className={cn(menuItemClass, "text-danger")} onSelect={actions.askDelete}>
                  <TrashIcon className={cn(menuIconClass, "text-danger")} /> Löschen <Shortcut>⌫</Shortcut>
                </ContextMenu.Item>
              </>
            )}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <DeleteMaterialDialog item={item} actions={actions} />
    </>
  );
};

export default MaterialMenu;
