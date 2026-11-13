import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, LayoutGrid, Plus } from "lucide-react";
import { classColor } from "../../shared/constants/classColors";
import { useT } from "../../shared/hooks/useT";
import { useActiveClass, useClasses } from "../../shared/store/classesStore";
import { usePlanStore } from "../../shared/store/planStore";
import { classSubtitle, classTitle } from "../../shared/utils/classes";
import { cn } from "../../shared/utils/cn";
import ClassBadge from "../ui/ClassBadge";
import { menuContentClass, menuIconClass, menuItemClass, menuSeparatorClass } from "../ui/menuStyles";

// ─────────────────────────────────────────────────────────────
// Чип класса «9b ⌄» и меню переключения (макеты 29 handy-09, pc-02):
// мои классы (одно нажатие — другой класс), «Alle Klassen», «Klasse hinzufügen».
// variant: "phone" — чип над заголовком недели; "side" — маленький значок у логотипа на ПК.
// all — на «Meine Klassen» чип пишет «Alle». Старый сервер без классов — чипа нет.
// ─────────────────────────────────────────────────────────────
const ClassSwitcher = ({ variant = "phone", all = false }) => {
  const t = useT();
  const navigate = useNavigate();
  const list = useClasses((s) => s.list);
  const active = useActiveClass();
  const openClass = usePlanStore((s) => s.openClass);
  const demo = usePlanStore((s) => s.meta?.demo);
  if (list.length === 0 || !active) return null;

  const pick = (id) => {
    navigate("/");
    openClass(id);
  };

  // На ПК — такой же значок, как был у класса раньше («9B» у логотипа, макет pc-02): без стрелки, иначе он не помещается
  const chip =
    variant === "side"
      ? cn("rounded-full px-2 py-0.75 text-micro leading-none font-extrabold uppercase transition-colors hover:bg-hair", all ? "bg-accent text-on-accent hover:bg-accent" : "bg-sand text-ink")
      : cn("flex h-6.5 items-center gap-0.5 rounded-full pr-1.5 pl-2.5 text-label font-extrabold", all ? "bg-accent text-on-accent" : classColor(active.color).tint);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={cn(chip, "shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent/50")} aria-label={t("Klasse wechseln")}>
        {all ? t("Alle") : active.name}
        {variant !== "side" && <ChevronDown className="size-3.5" />}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={6} className={cn(menuContentClass, "w-72")}>
          {demo && variant === "side" && <p className="px-3 pt-1.5 pb-1 text-micro font-extrabold text-accent-ink uppercase">Demo · {t("ausgedachte Daten")}</p>}
          {list.map((item) => (
            <DropdownMenu.Item key={item.id} onSelect={() => pick(item.id)} className={cn(menuItemClass, "gap-3 py-2", item.id === active.id && !all && "bg-sand")}>
              <ClassBadge name={item.name} color={item.color} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-row font-extrabold text-ink">{classTitle(item, t)}</span>
                <span className="block truncate text-caption font-normal text-faint">{item.gone ? t("Zugang beendet") : classSubtitle(item)}</span>
              </span>
              {item.id === active.id && !all && <Check className="size-4.5 shrink-0 text-accent-ink" />}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className={menuSeparatorClass} />
          <DropdownMenu.Item onSelect={() => navigate("/klassen")} className={menuItemClass}>
            <LayoutGrid className={menuIconClass} /> {t("Alle Klassen")}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => navigate("/klassen?sheet=klasseneu")} className={menuItemClass}>
            <Plus className={menuIconClass} /> {t("Klasse hinzufügen")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ClassSwitcher;
