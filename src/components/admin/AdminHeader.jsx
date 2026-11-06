import { ChevronLeft } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Шапка сторінки адмінки: «Admin · 9b» над заголовком, праворуч кнопки (actions).
// backTo — кнопка «назад» на телефоні (Protokoll, Kurse); на ПК її немає: там сайдбар.
// accent — фіолетовий рядок над заголовком (Übersicht)
// ─────────────────────────────────────────────────────────────
const AdminHeader = ({ title, backTo, accent = false, actions }) => {
  const { schoolClass } = useOutletContext() ?? {}; // клас із /public/info (оболонка)

  return (
    <header className="flex items-end gap-2.5">
      {backTo && (
        <Link to={backTo} aria-label="Zurück" className="grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink lg:hidden">
          <ChevronLeft className="size-4.5" />
        </Link>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn("text-hint font-extrabold", accent ? "text-accent-ink" : "text-faint")}>{schoolClass ? `Admin · ${schoolClass}` : "Admin"}</p>
        <h1 className="truncate text-title text-ink lg:text-lobby">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </header>
  );
};

export default AdminHeader;
