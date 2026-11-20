import { ChevronLeft } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useNotenStore } from "../../shared/store/notenStore";
import { useNotenRefresh } from "../../shared/hooks/useNotenRefresh";
import { cn } from "../../shared/utils/cn";
import { SyncIcon } from "../ui/icons";
import RoundButton from "../ui/RoundButton";

// Кнопка «обновить»: пока идёт запрос — крутится и не нажимается
export const RefreshButton = () => {
  const t = useT();
  const busy = useNotenStore((s) => s.busy);
  const refresh = useNotenRefresh();
  return (
    <RoundButton onClick={refresh} disabled={busy} aria-label={t("Aktualisieren")}>
      <SyncIcon className={cn("size-4.5", busy && "animate-spin")} />
    </RoundButton>
  );
};

// Шапка «Leistung · Noten» (или «Noten · Fehlzeiten» с «назад»). aside — справа (кнопка обновления)
const NotenHeader = ({ eyebrow, title, backTo, aside }) => {
  const t = useT();
  return (
    <header className="flex items-end gap-2.5">
      {backTo && (
        <RoundButton to={backTo} aria-label={t("Zurück")}>
          <ChevronLeft className="size-4.5" />
        </RoundButton>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-hint font-extrabold text-faint">{eyebrow}</p>
        <h1 className="truncate text-title text-ink lg:text-hero">{title}</h1>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
};

export default NotenHeader;
