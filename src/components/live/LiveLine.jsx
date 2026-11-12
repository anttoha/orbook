import { ChevronRight } from "lucide-react";
import { useSheet } from "../../shared/hooks/useSheet";
import { useTicker } from "../../shared/hooks/useTicker";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { weekCheckSource } from "../../shared/utils/lessons";
import { agoText } from "../../shared/utils/liveText";
import RefreshButton from "../week/RefreshButton";
import LiveDot from "./LiveDot";

// ─────────────────────────────────────────────────────────────
// Строка под заголовком недели (часть 26, макет handy-07): «● Live · geprüft vor 20 Sek. ›» + «Neu laden».
// Нажатие открывает «Plan-Status» этой недели. Без связи: «○ Nicht live · geprüft vor 3 Min.».
// days — дни недели: пока статуса нет, время проверки берём из них (как раньше «aktualisiert …»).
// ─────────────────────────────────────────────────────────────
const LiveLine = ({ days, monday }) => {
  const { openSheet } = useSheet();
  const live = usePlanStore((s) => s.live) === "live";
  const status = usePlanStore((s) => s.status);
  const now = useTicker();
  const checkedAt = status?.lastOkAt ?? weekCheckSource(days)?.fetchedAt;
  const stale = Boolean(status?.stale);
  const ago = agoText(checkedAt, now);

  return (
    <div className="-mt-2 flex items-center gap-1">
      <button
        type="button"
        onClick={() => openSheet("status", { datum: monday })}
        className="-mx-1.5 flex min-w-0 items-center gap-2 rounded-full px-1.5 py-1 text-caption transition-colors hover:bg-sand"
      >
        <LiveDot on={live && !stale} />
        <span className="truncate text-faint">
          <span className={cn("font-extrabold", stale ? "text-danger" : live ? "text-ok" : "text-muted")}>{stale ? "Veraltet" : live ? "Live" : "Nicht live"}</span>
          {ago && ` · geprüft ${ago}`}
        </span>
        <ChevronRight className="size-3 shrink-0 text-faint2" />
      </button>
      <RefreshButton className="-my-1 ml-auto" monday={monday} />
    </div>
  );
};

export default LiveLine;
