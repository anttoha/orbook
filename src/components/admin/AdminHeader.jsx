import { ChevronLeft } from "lucide-react";

import { useAdminClasses } from "../../shared/hooks/useAdminClasses";
import { cn } from "../../shared/utils/cn";
import AdminClassChip from "./schools/AdminClassChip";
import RoundButton from "../ui/RoundButton";

// ─────────────────────────────────────────────────────────────
// Шапка сторінки адмінки: «Admin · 9b ⌄» над заголовком, праворуч кнопки (actions).
// backTo — кнопка «назад» на телефоні (Protokoll, Kurse); на ПК її немає: там сайдбар.
// accent — фіолетовий рядок над заголовком (Übersicht)
// server — сторінка всього сервера («Schulen & Klassen»): замість чипа класу «Admin · Server»
// ─────────────────────────────────────────────────────────────
const AdminHeader = ({ title, backTo, accent = false, server = false, actions }) => {
  const { current } = useAdminClasses(); // null — список классов ещё не пришёл

  return (
    <header className="flex items-end gap-2.5">
      {backTo && (
        <RoundButton to={backTo} aria-label="Zurück" look="grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink lg:hidden">
          <ChevronLeft className="size-4.5" />
        </RoundButton>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className={cn("flex h-6.5 items-center gap-1.5 text-hint font-extrabold", accent || server ? "text-accent-ink" : "text-faint")}>
          {server ? "Admin · Server" : current ? "Admin ·" : "Admin"}
          {!server && <AdminClassChip />}
        </div>
        <h1 className="truncate text-title text-ink lg:text-lobby">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </header>
  );
};

export default AdminHeader;
