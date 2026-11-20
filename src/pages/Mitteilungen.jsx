import { BellOff, Bell, Settings, SquarePlus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import InstallCard from "../components/push/InstallCard";
import InstallSteps from "../components/push/InstallSteps";
import { APP_BLOCKED_STEPS, BLOCKED_STEPS } from "../components/push/steps";
import BeforeCard from "../components/push/BeforeCard";
import PushCourses from "../components/push/PushCourses";
import PushHero from "../components/push/PushHero";
import PushPreview from "../components/push/PushPreview";
import PushPrefs from "../components/push/PushPrefs";
import PushStatus from "../components/push/PushStatus";
import QuietCard from "../components/push/QuietCard";
import TelegramCard from "../components/push/TelegramCard";
import Button from "../components/ui/Button";
import { RenewIcon } from "../components/ui/icons";
import PageHeader from "../components/ui/PageHeader";
import StateScreen from "../components/ui/StateScreen";
import { useSheet } from "../shared/hooks/useSheet";
import { hasAppNotify, openAppNotifySettings } from "../shared/api/android";
import { appNotenState, hasAppNoten } from "../shared/api/noten";
import { usePlanStore } from "../shared/store/planStore";
import { pushErrorText, usePushStore } from "../shared/store/pushStore";
import { useUserStore } from "../shared/store/userStore";
import { courseCount } from "../shared/utils/courses";
import { useClassEyebrow } from "../shared/hooks/useClassEyebrow";
import { useT } from "../shared/hooks/useT";
import { translate } from "../shared/i18n/translate";

// ─────────────────────────────────────────────────────────────
// «Mitteilungen» (Soft 26 + макеты части 17). Что приходит и когда — docs/API.md «Mitteilungen».
// Сверху — что с устройством: включено / ещё нет / iPhone без установки / заблокировано.
// Под ней — личный бот Telegram (часть 27b), ниже — пункты, курсы и Ruhezeit (пока не включено — серым).
// Часть 31e (макеты 31e): в Android-приложении уведомления делает само приложение — без курсов и
// «ORBook als App», зато с «Vor der Stunde»; запрет — в настройках Android.
// ─────────────────────────────────────────────────────────────
const Mitteilungen = () => {
  const t = useT();
  const eyebrow = useClassEyebrow(translate("Mehr")); // несколько классов — «Klasse 8b»: Mitteilungen у каждого класса свои (часть 29)
  const me = usePlanStore((s) => s.me);
  const courses = usePlanStore((s) => s.courses);
  const picked = useUserStore((s) => s.picked);
  const hiddenRequired = useUserStore((s) => s.hiddenRequired);
  const { enabled, support, busy, reminderTime, check, enable, disable } = usePushStore();
  const app = hasAppNotify();
  const on = enabled && (support === "ok" || support === "app");
  const count = courseCount(courses, picked, hiddenRequired);
  // Часть 36c: «Neue Note» — приложение само ходит в InfoPoint, нужен сохранённый логин
  const noten = app && hasAppNoten() && me?.features?.noten === true;
  const notenLocked = noten && !appNotenState()?.saved;

  // При открытии: что умеет браузер и знает ли сервер это устройство.
  // Вернулись из настроек Android (разрешили уведомления) — проверить ещё раз
  useEffect(() => {
    check();
    const again = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", again);
    return () => document.removeEventListener("visibilitychange", again);
  }, [check]);

  const turnOn = async () => {
    try {
      if (await enable()) toast.success(translate("Mitteilungen sind an"));
    } catch (error) {
      toast.error(pushErrorText(error));
    }
  };

  const turnOff = async () => {
    await disable().catch((error) => toast.error(pushErrorText(error)));
    toast.success(translate("Mitteilungen auf diesem Gerät aus"));
  };

  if (me?.features?.push === false) {
    return (
      <section className="flex flex-col gap-4.5">
        <PageHeader backTo="/mehr" eyebrow={eyebrow} title={t("Mitteilungen")} />
        <StateScreen icon={BellOff} title={t("Ausgeschaltet")} text={t("Deine Schule hat Mitteilungen gerade ausgeschaltet.")} />
        <TelegramCard />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 lg:max-w-186">
      <PageHeader backTo="/mehr" eyebrow={eyebrow} title={t("Mitteilungen")} />
      <Top support={support} on={on} busy={busy} onEnable={turnOn} />
      <TelegramCard />
      {!app && !on && support !== "ios-install" && <InstallCard />}
      <PushPreview app={app} />
      <PushPrefs reminderTime={reminderTime} disabled={!on} noten={noten} notenLocked={notenLocked} />
      {app ? <BeforeCard disabled={!on} /> : <PushCourses courseCount={count.all > 0 ? count.on : null} disabled={!on} />}
      <div className="flex flex-col gap-3">
        <QuietCard disabled={!on} />
        <p className="text-caption text-faint">{t("Fällt in der Ruhezeit eine Stunde aus, kommt das, sobald sie vorbei ist.")}</p>
      </div>
      {on && (
        <div className="flex flex-col items-center gap-3">
          <Button variant="danger" onClick={turnOff} disabled={busy} className="w-full flex-none bg-card">
            <BellOff className="size-4" /> {t("Auf diesem Gerät ausschalten")}
          </Button>
        </div>
      )}
    </section>
  );
};

// Верхняя карточка по состоянию устройства
const Top = ({ support, on, busy, onEnable }) => {
  const t = useT();
  const { openSheet } = useSheet();
  const recheck = usePushStore((s) => s.check);

  if (on) return <PushStatus app={support === "app"} />;
  if (support === "app-denied") {
    return (
      <div className="flex flex-col gap-3">
        <PushHero icon={BellOff} tone="sand" title={t("Auf dem Handy blockiert")} text={t("Du hast Mitteilungen für ORBook einmal abgelehnt. Erlauben geht in den Einstellungen.")}>
          <Button variant="primary" onClick={openAppNotifySettings} className="flex-none">
            <Settings className="size-4" /> {t("Einstellungen öffnen")}
          </Button>
        </PushHero>
        <h2 className="mt-3 text-hint font-extrabold text-faint">{t("So erlaubst du sie wieder")}</h2>
        <InstallSteps steps={APP_BLOCKED_STEPS} />
      </div>
    );
  }
  if (support === "ios-install") {
    return (
      <PushHero icon={SquarePlus} title={t("Erst auf den Home-Bildschirm")} text={t("Auf dem iPhone kommen Mitteilungen nur, wenn ORBook als App drauf ist.")} foot={t("Ab iOS 16.4 · dauert 10 Sekunden")}>
        <Button variant="primary" onClick={() => openSheet("installieren")} className="flex-none">
          <SquarePlus className="size-4" /> {t("Zeig mir, wie")}
        </Button>
      </PushHero>
    );
  }
  if (support === "unsupported") {
    return <PushHero icon={BellOff} tone="sand" title={t("Geht in diesem Browser nicht")} text={t("Probier Chrome, Edge, Firefox oder Safari.")} />;
  }
  if (support === "denied") {
    return (
      <div className="flex flex-col gap-3">
        <PushHero icon={BellOff} tone="sand" title={t("Im Browser blockiert")} text={t("Du hast Mitteilungen für ORBook mal abgelehnt. Wieder erlauben geht nur im Browser.")} />
        <h2 className="mt-3 text-hint font-extrabold text-faint">{t("So erlaubst du sie wieder")}</h2>
        <InstallSteps steps={BLOCKED_STEPS} />
        <p className="text-caption text-faint">{t("iPhone: Einstellungen → Mitteilungen → ORBook.")}</p>
        <Button onClick={recheck} className="flex-none">
          <RenewIcon className="size-4" /> {t("Nochmal prüfen")}
        </Button>
      </div>
    );
  }
  return (
    <PushHero icon={Bell} title={t("Mitteilungen sind aus")} text={t("ORBook meldet sich, wenn sich dein Plan ändert oder morgen ein Test ist.")} foot={support === "app" ? t("Android fragt einmal, ob ORBook darf.") : t("Dein Browser fragt einmal, ob er darf.")}>
      <Button variant="primary" onClick={onEnable} disabled={busy} className="flex-none">
        <Bell className="size-4" /> {t("Einschalten")}
      </Button>
    </PushHero>
  );
};

export default Mitteilungen;
