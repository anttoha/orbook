import { Link } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Меню вкладки-группы над нижней панелью (часть 35).
// look: "kompakt" — узкие строки без заголовка; "gross" — заголовок группы и иконки в кружках.
// hover — пункт под пальцем во время жеста «зажал вкладку и повёл вверх» (подсвечен акцентом).
// Каждая строка помечена data-nav-item: по нему жест находит, что под пальцем.
// align: "start" — меню прижато к левому краю вкладки (первая вкладка), иначе по центру над ней.
// Анимации (index.css): меню вырастает из вкладки (menu-up), строки поднимаются по очереди (item-rise),
// closing — меню уходит вниз (menu-down), после этого onClosed убирает его со страницы
// ─────────────────────────────────────────────────────────────
const GroupMenu = ({ id, group, look = "kompakt", hover = null, align = "center", onPick, closing = false, onClosed }) => {
  const t = useT();
  const big = look === "gross";

  return (
    <div
      id={id}
      role="menu"
      aria-label={group.label}
      aria-hidden={closing || undefined}
      onAnimationEnd={(event) => closing && event.target === event.currentTarget && onClosed?.()}
      className={cn(
        "absolute bottom-full mb-3.5 rounded-panel border border-hair bg-card p-1.5 text-ink shadow-menu",
        closing ? "pointer-events-none animate-menu-down" : "animate-menu-up",
        big ? "w-53" : "w-39",
        align === "start" ? "left-0 origin-bottom-left" : "left-1/2 origin-bottom -translate-x-1/2",
      )}
    >
      {big && <p className="px-3 pt-2 pb-1.5 text-label font-extrabold tracking-wide text-faint uppercase">{group.label}</p>}
      {group.items.map((item, index) => {
        const under = hover === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            role="menuitem"
            data-nav-item={item.to}
            aria-current={item.active ? "page" : undefined}
            onClick={onPick}
            style={{ animationDelay: `${60 + index * 40}ms` }}
            className={cn(
              "flex animate-item-rise items-center gap-3 rounded-tile px-2.5 transition-[background-color,color,scale] duration-150 select-none",
              big ? "h-12" : "h-10",
              under ? "scale-103 bg-accent text-on-accent" : item.active ? "bg-tint" : "hover:bg-sand",
            )}
          >
            <span className={cn("grid shrink-0 place-items-center", big && "size-8 rounded-full", big && !under && "bg-tint")}>
              <item.icon className={cn("size-5", under ? "text-on-accent" : "text-accent-ink")} />
            </span>
            <span className={cn("flex-1 truncate", big ? "text-body font-bold" : "text-body-sm font-extrabold")}>{t(item.label)}</span>
            {item.count > 0 && <span className={cn("text-caption font-extrabold", under ? "text-on-accent" : "text-faint")}>{item.count}</span>}
          </Link>
        );
      })}
    </div>
  );
};

export default GroupMenu;
