import { useEffect, useState } from "react";
import { QrCode as QrIcon } from "lucide-react";
import { toast } from "sonner";
import { useSheet } from "../../shared/hooks/useSheet";
import { useSyncStore } from "../../shared/store/syncStore";
import { cn } from "../../shared/utils/cn";
import { syncedText } from "../../shared/utils/notes";
import { CheckIcon, CopyIcon, SyncIcon, WarningIcon } from "../ui/icons";
import RoundButton from "../ui/RoundButton";
import Liquid from "../ui/Liquid";

// ─────────────────────────────────────────────────────────────
// Карточка «Dein Sync-Code» (макет 21, часть 25 handy-07): код, «QR» и «Kopieren», строка состояния под ним.
// Код из 20 знаков переносится по дефисам. На ПК QR и так виден справа — кнопки QR нет
// ─────────────────────────────────────────────────────────────
const SyncCodeCard = ({ code }) => {
  const { openSheet } = useSheet();
  const [copied, setCopied] = useState(false); // 1,5 с вместо значка «копировать» — галочка
  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code kopiert");
    } catch {
      toast.error("Kopieren nicht möglich"); // браузер запретил доступ к буферу
    }
  };

  return (
    <Liquid as="div" refract press={false} className="rounded-card bg-card px-4 py-4.5">
      <p className="text-hint font-extrabold text-faint">Dein Sync-Code</p>
      <div className="mt-2.5 flex items-start gap-2">
        <p className="min-w-0 flex-1 text-number tracking-code text-ink">{code}</p>
        <RoundButton onClick={() => openSheet("syncqr")} aria-label="Code als QR zeigen" look="-mt-1 grid size-11 shrink-0 place-items-center rounded-full bg-tint text-accent-ink transition-transform duration-150 active:scale-90 lg:hidden">
          <QrIcon className="size-4.25" />
        </RoundButton>
        <RoundButton onClick={copy} aria-label="Code kopieren" look={cn("-mt-1 grid size-11 shrink-0 place-items-center rounded-full transition-[background-color,scale] duration-200 active:scale-90", copied ? "bg-ok-tint text-ok" : "bg-sand text-ink hover:bg-paper")}>
          {copied ? <CheckIcon key="ok" className="size-4.25 motion-safe:animate-check-pop" /> : <CopyIcon className="size-4.25" />}
        </RoundButton>
      </div>
      <SyncStatus />
    </Liquid>
  );
};

// «✓ Zuletzt synchronisiert heute 07:40 · alles aktuell» / «Wird synchronisiert …» / ошибка
const SyncStatus = () => {
  const { status, error, lastSyncAt } = useSyncStore();
  if (status === "syncing") return <StatusLine icon={SyncIcon} className="text-faint" text="Wird synchronisiert …" />;
  if (status === "error") return <StatusLine icon={WarningIcon} className="text-danger" text={error} />;
  return <StatusLine icon={CheckIcon} className={lastSyncAt ? "text-ok" : "text-faint"} text={syncedText(lastSyncAt)} />;
};

const StatusLine = ({ icon: Icon, className, text }) => (
  <p role="status" className={cn("mt-3 flex items-start gap-1.5 text-hint", className)}>
    <Icon className="mt-0.5 size-3.5 shrink-0" />
    <span>{text}</span>
  </p>
);

export default SyncCodeCard;
