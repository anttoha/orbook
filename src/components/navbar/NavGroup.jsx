import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useNavFlash } from "../../shared/store/navFlashStore";
import { cn } from "../../shared/utils/cn";
import NavFlash from "./NavFlash";
import NavigationLink from "./NavigationLink";

// ─────────────────────────────────────────────────────────────
// Група в сайдбарі ПК (частина 35, макет pc-01): заголовок із шевроном і розділи зі зсувом.
// Розгорнута за замовчуванням; якщо всередині відкритий розділ — завжди розгорнута.
// Згорнутий сайдбар: лише іконки розділів, без заголовка
// ─────────────────────────────────────────────────────────────
const NavGroup = ({ group, index, isHidden }) => {
  const t = useT();
  const [open, setOpen] = useState(true);
  const flash = useNavFlash("pc", group.id); // часть 38: после правки группа коротко светится
  const shown = open || group.active;
  const links = group.items.map((item, i) => (
    <NavigationLink key={item.to} index={index + i} active={item.active} tab={item} isHidden={isHidden} badge={item.count || null} />
  ));

  if (isHidden) return <div className="space-y-1">{links}</div>;

  return (
    <div>
      <button
        type="button"
        aria-expanded={shown}
        data-tour={`nav-${group.id}`}
        onClick={() => setOpen(!open)}
        className="relative flex h-10.5 w-full items-center gap-3 rounded-full px-3 text-body font-semibold text-ink/80 transition-colors hover:bg-sand"
      >
        <NavFlash stamp={flash} />
        <group.icon className="size-5 shrink-0" />
        <span className="flex-1 truncate text-left">{t(group.label)}</span>
        <ChevronDown className={cn("size-4 text-faint transition-transform", shown && "rotate-180")} />
      </button>
      {/* Раскрывается плавно: высота растёт от 0 до содержимого (grid 0fr → 1fr), строки проявляются.
          Свёрнутые ссылки остаются в разметке, но inert — их не достать ни мышью, ни Tab */}
      <div
        inert={!shown}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-soft motion-reduce:transition-none",
          shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-1 ml-5.5 space-y-1 border-l border-rule pl-2">{links}</div>
        </div>
      </div>
    </div>
  );
};

export default NavGroup;
