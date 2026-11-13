import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { classColor } from "../../../shared/constants/classColors";
import { useAdminClasses } from "../../../shared/hooks/useAdminClasses";
import { useAdminStore } from "../../../shared/store/adminStore";
import { cn } from "../../../shared/utils/cn";
import ClassBadge from "../../ui/ClassBadge";
import { SchoolIcon } from "../../ui/icons";
import { menuContentClass, menuIconClass, menuItemClass, menuSeparatorClass } from "../../ui/menuStyles";

// ─────────────────────────────────────────────────────────────
// Чип класса в шапке админки «Admin · 9b ⌄» (часть 29, макет handy-16).
// Всё в админке (коды, тесты, Muster, Kanäle, Einstellungen) относится к выбранному классу.
// Меню: все классы сервера (со школой) и «Schulen & Klassen verwalten».
// ─────────────────────────────────────────────────────────────
const AdminClassChip = () => {
  const navigate = useNavigate();
  const { list, current } = useAdminClasses();
  const setClass = useAdminStore((s) => s.setClass);
  if (!current) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger aria-label="Klasse wechseln" className={cn("flex h-6.5 shrink-0 items-center gap-0.5 rounded-full pr-1.5 pl-2.5 text-label font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-accent/50", classColor(current.color).tint)}>
        {current.name}
        <ChevronDown className="size-3.5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={6} className={cn(menuContentClass, "w-72")}>
          {list.map((item) => (
            <DropdownMenu.Item key={item.id} onSelect={() => setClass(item.id)} className={cn(menuItemClass, "gap-3 py-2", item.id === current.id && "bg-sand")}>
              <ClassBadge name={item.name} color={item.color} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-row font-extrabold text-ink">Klasse {item.name}</span>
                <span className="block truncate text-caption font-normal text-faint">{item.school.name}</span>
              </span>
              {item.id === current.id && <Check className="size-4.5 shrink-0 text-accent-ink" />}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className={menuSeparatorClass} />
          <DropdownMenu.Item onSelect={() => navigate("/admin/schulen")} className={menuItemClass}>
            <SchoolIcon className={menuIconClass} /> Schulen & Klassen verwalten
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default AdminClassChip;
