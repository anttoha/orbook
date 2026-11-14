import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { useInstallPrompt } from "../../shared/hooks/useInstallPrompt";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePushStore } from "../../shared/store/pushStore";
import { promptInstall } from "../../shared/utils/serviceWorker";
import OrbitMark from "../ui/OrbitMark";
import PillButton from "../ui/PillButton";
import RoundButton from "../ui/RoundButton";

// «ORBook als App» вверху Mehr (макет 17 handy-09): пока не установлено и не закрыто ✕.
// Android/ПК — окно браузера, iPhone — шторка с шагами
const InstallCard = () => {
  const how = useInstallPrompt();
  const dismissed = usePushStore((s) => s.installDismissed);
  const dismiss = usePushStore((s) => s.dismissInstall);
  const { openSheet } = useSheet();
  if (!how || dismissed) return null;

  const install = async () => {
    if (how === "ios") return openSheet("installieren");
    if (await promptInstall()) toast.success("ORBook ist jetzt installiert");
  };

  return (
    <section className="relative flex flex-col gap-3.5 rounded-card bg-tint p-3.5 animate-rise-in motion-reduce:animate-none">
      <div className="flex items-center gap-3 pr-8">
        <span className="grid size-11 shrink-0 place-items-center rounded-tile border border-rule bg-card">
          <OrbitMark className="size-8" />
        </span>
        <div className="min-w-0">
          <p className="text-row font-extrabold text-ink">ORBook als App</p>
          <p className="text-caption text-muted">Eigenes Symbol, schneller Start, Mitteilungen.</p>
        </div>
      </div>
      <RoundButton onClick={dismiss} aria-label="Nicht mehr zeigen" look="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-card text-muted">
        <X className="size-4" />
      </RoundButton>
      <PillButton glass="filled" size="md" onClick={install} className="flex h-10 items-center justify-center gap-2 rounded-full bg-accent text-label font-extrabold text-on-accent transition-transform active:scale-95">
        <Download className="size-4" aria-hidden="true" /> Installieren
      </PillButton>
    </section>
  );
};

export default InstallCard;
