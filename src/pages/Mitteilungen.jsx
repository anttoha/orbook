import { BellOff, Bell, SquarePlus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import InstallCard from "../components/push/InstallCard";
import InstallSteps from "../components/push/InstallSteps";
import { BLOCKED_STEPS } from "../components/push/steps";
import PushCourses from "../components/push/PushCourses";
import PushHero from "../components/push/PushHero";
import PushPreview from "../components/push/PushPreview";
import PushPrefs from "../components/push/PushPrefs";
import PushStatus from "../components/push/PushStatus";
import QuietCard from "../components/push/QuietCard";
import Button from "../components/ui/Button";
import { RenewIcon } from "../components/ui/icons";
import PageHeader from "../components/ui/PageHeader";
import StateScreen from "../components/ui/StateScreen";
import { useSheet } from "../shared/hooks/useSheet";
import { usePlanStore } from "../shared/store/planStore";
import { pushErrorText, usePushStore } from "../shared/store/pushStore";
import { useUserStore } from "../shared/store/userStore";
import { courseCount } from "../shared/utils/courses";

// ─────────────────────────────────────────────────────────────
// «Mitteilungen» (Soft 26 + макеты части 17). Что приходит и когда — docs/API.md «Mitteilungen».
// Сверху — что с устройством: включено / ещё нет / iPhone без установки / заблокировано.
// Ниже — пункты, курсы и Ruhezeit (пока не включено — серым: видно, что будет).
// ─────────────────────────────────────────────────────────────
const Mitteilungen = () => {
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const { enabled, support, busy, reminderTime, check, enable, disable } = usePushStore();
  const on = enabled && support === "ok";
  const count = courseCount(courses, picked, hiddenRequired);

  // При открытии: что умеет браузер и знает ли сервер это устройство
  useEffect(() => {
    check();
  }, [check]);

  const turnOn = async () => {
    try {
      if (await enable()) toast.success("Mitteilungen sind an");
    } catch (error) {
      toast.error(pushErrorText(error));
    }
  };

  const turnOff = async () => {
    await disable().catch((error) => toast.error(pushErrorText(error)));
    toast.success("Mitteilungen auf diesem Gerät aus");
  };

  if (me?.features?.push === false) {
    return (
      <section className="flex flex-col gap-4.5">
        <PageHeader backTo="/mehr" eyebrow="Mehr" title="Mitteilungen" />
        <StateScreen icon={BellOff} title="Ausgeschaltet" text="Deine Schule hat Mitteilungen gerade ausgeschaltet." />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 lg:max-w-186">
      <PageHeader backTo="/mehr" eyebrow="Mehr" title="Mitteilungen" />
      <Top support={support} on={on} busy={busy} onEnable={turnOn} />
      {!on && support !== "ios-install" && <InstallCard />}
      <PushPreview />
      <PushPrefs reminderTime={reminderTime} disabled={!on} />
      <PushCourses courseCount={count.all > 0 ? count.on : null} disabled={!on} />
      <div className="flex flex-col gap-3">
        <QuietCard disabled={!on} />
        <p className="text-caption text-faint">Fällt in der Ruhezeit eine Stunde aus, kommt das, sobald sie vorbei ist.</p>
      </div>
      {on && (
        <div className="flex flex-col items-center gap-3">
          <Button variant="danger" onClick={turnOff} disabled={busy} className="w-full flex-none bg-card">
            <BellOff className="size-4" /> Auf diesem Gerät ausschalten
          </Button>
          <p className="text-center text-caption text-faint">Ohne Namen. Der Server kennt nur dieses Gerät und deine Kurse.</p>
        </div>
      )}
    </section>
  );
};

// Верхняя карточка по состоянию устройства
const Top = ({ support, on, busy, onEnable }) => {
  const { openSheet } = useSheet();
  const recheck = usePushStore((s) => s.check);

  if (on) return <PushStatus />;
  if (support === "ios-install") {
    return (
      <PushHero icon={SquarePlus} title="Erst auf den Home-Bildschirm" text="Auf dem iPhone kommen Mitteilungen nur, wenn ORBook als App drauf ist." foot="Ab iOS 16.4 · dauert 10 Sekunden">
        <Button variant="primary" onClick={() => openSheet("installieren")} className="flex-none">
          <SquarePlus className="size-4" /> Zeig mir, wie
        </Button>
      </PushHero>
    );
  }
  if (support === "unsupported") {
    return <PushHero icon={BellOff} tone="sand" title="Geht in diesem Browser nicht" text="Probier Chrome, Edge, Firefox oder Safari." />;
  }
  if (support === "denied") {
    return (
      <div className="flex flex-col gap-3">
        <PushHero icon={BellOff} tone="sand" title="Im Browser blockiert" text="Du hast Mitteilungen für ORBook mal abgelehnt. Wieder erlauben geht nur im Browser." />
        <h2 className="mt-3 text-hint font-extrabold text-faint">So erlaubst du sie wieder</h2>
        <InstallSteps steps={BLOCKED_STEPS} />
        <p className="text-caption text-faint">iPhone: Einstellungen → Mitteilungen → ORBook.</p>
        <Button onClick={recheck} className="flex-none">
          <RenewIcon className="size-4" /> Nochmal prüfen
        </Button>
      </div>
    );
  }
  return (
    <PushHero icon={Bell} title="Mitteilungen sind aus" text="ORBook meldet sich, wenn sich dein Plan ändert oder morgen ein Test ist." foot="Dein Browser fragt einmal, ob er darf.">
      <Button variant="primary" onClick={onEnable} disabled={busy} className="flex-none">
        <Bell className="size-4" /> Einschalten
      </Button>
    </PushHero>
  );
};

export default Mitteilungen;
