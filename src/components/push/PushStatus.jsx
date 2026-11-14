import { Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { pushErrorText, usePushStore } from "../../shared/store/pushStore";
import { lastSentLabel } from "../../shared/utils/push";
import PillButton from "../ui/PillButton";

// Зелёная карточка «An auf diesem Gerät» + «Test senden» (макет 17 handy-01)
const PushStatus = () => {
  const lastSentAt = usePushStore((s) => s.lastSentAt);
  const test = usePushStore((s) => s.test);
  const [sending, setSending] = useState(false);

  const sendTest = async () => {
    setSending(true);
    try {
      const { sent } = await test();
      if (sent) toast.success("Test geschickt – kommt gleich an");
      else toast.error("Der Browser-Dienst hat den Test nicht angenommen");
    } catch (error) {
      toast.error(pushErrorText(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-card bg-ok-tint px-3.5 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card">
        <Bell className="size-4.5 text-ok" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-row font-extrabold text-ok">An auf diesem Gerät</p>
        <p className="truncate text-caption text-muted">{lastSentLabel(lastSentAt)}</p>
      </div>
      <PillButton glass="glass" size="sm"
       
        onClick={sendTest}
        disabled={sending} className="h-9 shrink-0 rounded-full bg-card px-3.5 text-label font-extrabold text-accent-ink transition-transform active:scale-95 disabled:opacity-50">
        Test senden
      </PillButton>
    </div>
  );
};

export default PushStatus;
