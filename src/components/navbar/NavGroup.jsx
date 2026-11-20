import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import NavigationLink from "./NavigationLink";

// ─────────────────────────────────────────────────────────────
// Група в сайдбарі ПК (частина 35, макет pc-01): заголовок із шевроном і розділи зі зсувом.
// Розгорнута за замовчуванням; якщо всередині відкритий розділ — завжди розгорнута.
// Згорнутий сайдбар: лише іконки розділів, без заголовка
// ─────────────────────────────────────────────────────────────
const NavGroup = ({ group, index, isHidden }) => {
  const t = useT();
  const [open, setOpen] = useState(true);
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
        onClick={() => setOpen(!open)}
        className="flex h-10.5 w-full items-center gap-3 rounded-full px-3 text-body font-semibold text-ink/80 transition-colors hover:bg-sand"
      >
        <group.icon className="size-5 shrink-0" />
        <span className="flex-1 truncate text-left">{t(group.label)}</span>
        <ChevronDown className={cn("size-4 text-faint transition-transform", shown && "rotate-180")} />
      </button>
      {shown && <div className="mt-1 ml-5.5 space-y-1 border-l border-rule pl-2">{links}</div>}
    </div>
  );
};

export default NavGroup;
