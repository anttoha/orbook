import { ChevronLeft } from "lucide-react";
import { useInSettingsPanel } from "../../shared/hooks/useSettingsPanel";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import RoundButton from "./RoundButton";

// Шапка сторінки на весь екран: кнопка «назад», рядок над заголовком, заголовок.
// Усередині «Einstellungen» на ПК — тільки заголовок розділу (panelTitle, якщо він інший):
// «назад» там не потрібна, бо зліва меню розділів. aside — кнопка праворуч (наприклад «+»).
// subpage — сторінка всередині розділу (Darstellung → Stundenplan): на ПК теж потрібна «назад» до розділу
const PageHeader = ({ backTo, eyebrow, eyebrowClassName, title, panelTitle, aside, subpage = false }) => {
  const inPanel = useInSettingsPanel();
  const t = useT();
  if (inPanel && subpage) {
    return (
      <header className="-ml-4.5 flex items-center gap-2.5">
        <RoundButton to={backTo} aria-label={t("Zurück zu {name}").replace("{name}", t(eyebrow))}>
          <ChevronLeft className="size-4.5" />
        </RoundButton>
        <div className="min-w-0">
          <p className="text-hint font-extrabold text-faint">{t(eyebrow)}</p>
          <h2 className="truncate text-heading text-ink">{t(panelTitle ?? title)}</h2>
        </div>
      </header>
    );
  }
  if (inPanel) return <h2 className="-ml-4.5 text-heading text-ink">{t(panelTitle ?? title)}</h2>; // ліворуч на одній лінії з «Übersicht»

  return (
    <header className="flex items-end gap-2.5">
      <RoundButton to={backTo} aria-label={t("Zurück")}>
        <ChevronLeft className="size-4.5" />
      </RoundButton>
      <div className="min-w-0 space-y-1">
        <p className={cn("text-hint font-extrabold text-faint", eyebrowClassName)}>{eyebrow && t(eyebrow)}</p>
        <h1 className="truncate text-title text-ink">{t(title)}</h1>
      </div>
      {aside && <div className="ml-auto shrink-0">{aside}</div>}
    </header>
  );
};

export default PageHeader;
