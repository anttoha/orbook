import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useInSettingsPanel } from "../../shared/hooks/useSettingsPanel";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// Шапка сторінки на весь екран: кнопка «назад», рядок над заголовком, заголовок.
// Усередині «Einstellungen» на ПК — тільки заголовок розділу (panelTitle, якщо він інший):
// «назад» там не потрібна, бо зліва меню розділів. aside — кнопка праворуч (наприклад «+»).
const PageHeader = ({ backTo, eyebrow, eyebrowClassName, title, panelTitle, aside }) => {
  const inPanel = useInSettingsPanel();
  const t = useT();
  if (inPanel) return <h2 className="-ml-4.5 text-heading text-ink">{t(panelTitle ?? title)}</h2>; // ліворуч на одній лінії з «Übersicht»

  return (
    <header className="flex items-end gap-2.5">
      <Link to={backTo} aria-label={t("Zurück")} className="grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
        <ChevronLeft className="size-4.5" />
      </Link>
      <div className="min-w-0 space-y-1">
        <p className={cn("text-hint font-extrabold text-faint", eyebrowClassName)}>{eyebrow && t(eyebrow)}</p>
        <h1 className="truncate text-title text-ink">{t(title)}</h1>
      </div>
      {aside && <div className="ml-auto shrink-0">{aside}</div>}
    </header>
  );
};

export default PageHeader;
