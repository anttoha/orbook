import { toast } from "sonner";
import { useSyncStore } from "../../shared/store/syncStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { syncedText, visibleNotes } from "../../shared/utils/notes";
import { CheckIcon, CopyIcon, SyncIcon, WarningIcon } from "../ui/icons";

// ─────────────────────────────────────────────────────────────
// Картка «Dein Sync-Code» (макет 21): код, «копіювати» і рядок стану під ним.
// Код із 20 знаків довший, ніж у макеті, тому шрифт менший і код переноситься по дефісах.
// ─────────────────────────────────────────────────────────────
const SyncCodeCard = ({ code }) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code kopiert");
    } catch {
      toast.error("Kopieren nicht möglich"); // браузер заборонив доступ до буфера
    }
  };

  return (
    <div className="rounded-card bg-card px-4 py-4.5">
      <p className="text-hint font-extrabold text-faint">Dein Sync-Code</p>
      <div className="mt-2.5 flex items-start gap-3">
        <p className="min-w-0 flex-1 text-number tracking-code text-ink">{code}</p>
        <button type="button" onClick={copy} aria-label="Code kopieren" className="-mt-1 grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink hover:bg-paper">
          <CopyIcon className="size-4.25" />
        </button>
      </div>
      <SyncStatus />
    </div>
  );
};

// «✓ Zuletzt synchronisiert heute 07:40 · 6 Notizen» / «Wird synchronisiert …» / помилка
const SyncStatus = () => {
  const { status, error, lastSyncAt } = useSyncStore();
  const count = useUserStore((s) => visibleNotes(s.notes).length);

  if (status === "syncing") return <StatusLine icon={SyncIcon} className="text-faint" text="Wird synchronisiert …" />;
  if (status === "error") return <StatusLine icon={WarningIcon} className="text-danger" text={error} />;
  return <StatusLine icon={CheckIcon} className={lastSyncAt ? "text-ok" : "text-faint"} text={syncedText(lastSyncAt, count)} />;
};

const StatusLine = ({ icon: Icon, className, text }) => (
  <p role="status" className={cn("mt-3 flex items-start gap-1.5 text-hint", className)}>
    <Icon className="mt-0.5 size-3.5 shrink-0" />
    <span>{text}</span>
  </p>
);

export default SyncCodeCard;
