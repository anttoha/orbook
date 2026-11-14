import { Send } from "lucide-react";
import { errorLine, groupLine } from "../../../shared/utils/channels";
import { cn } from "../../../shared/utils/cn";
import { WarningIcon } from "../../ui/icons";
import PillButton from "../../ui/PillButton";

// Карточка вверху (макет 27 handy-01/08): зелёная «Telegram · verbunden» с «Test senden»
// или розовая «Nicht angekommen» с «Neu verbinden»
const GroupStatus = ({ group, busy, onTest, onReconnect }) => {
  const ok = !group.error;
  const Icon = ok ? Send : WarningIcon;
  return (
    <div className={cn("flex items-center gap-3 rounded-card px-3.5 py-3", ok ? "bg-ok-tint" : "bg-danger-tint")}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card">
        <Icon className={cn("size-4.5", ok ? "text-ok" : "text-danger")} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-row font-extrabold", ok ? "text-ok" : "text-danger")}>{ok ? "Telegram · verbunden" : "Nicht angekommen"}</p>
        <p className="truncate text-caption text-muted">{ok ? groupLine(group) : errorLine(group.error)}</p>
      </div>
      <PillButton
        glass={ok ? "tinted" : "destructive"}
        size="sm"
        onClick={ok ? onTest : onReconnect}
        disabled={busy}
        className={cn(
          "h-9 shrink-0 rounded-full bg-card px-3.5 text-label font-extrabold transition-transform active:scale-95 disabled:opacity-50",
          ok ? "text-accent-ink" : "text-danger",
        )}
      >
        {ok ? "Test senden" : "Neu verbinden"}
      </PillButton>
    </div>
  );
};

export default GroupStatus;
