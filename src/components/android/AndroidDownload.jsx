import { Download, Globe, LayoutGrid, Pointer, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useInstallPrompt } from "../../shared/hooks/useInstallPrompt";
import { useInSettingsPanel } from "../../shared/hooks/useSettingsPanel";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { APK_PATH, releaseLabel, updateErrorText } from "../../shared/utils/android";
import { cn } from "../../shared/utils/cn";
import { promptInstall } from "../../shared/utils/serviceWorker";
import MenuRow from "../more/MenuRow";
import ListCard from "../ui/ListCard";
import OrbitMark from "../ui/OrbitMark";
import QrCode from "../ui/QrCode";
import WidgetPreview from "./WidgetPreview";
import Step from "./Step";

// Значок ORBook в кружке шага 3 (Step ждёт компонент-иконку с className)
const AppIcon = () => <OrbitMark className="size-6" />;

// Скачать APK: браузер сам качает файл. Что APK на сервере есть, мы уже знаем из /api/public/android.
// Нет сети — тост (макет 31 handy-09). Без HEAD-проверки: сервер отдаёт файл только на GET (HEAD → 405)
const download = () => {
  if (navigator.onLine === false) return toast.error(updateErrorText("network"));
  window.location.assign(APK_PATH);
};

const DownloadButton = ({ variant }) => {
  const t = useT();
  return (
    <button
      type="button"
      onClick={download}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-full text-row font-bold transition-opacity active:opacity-80",
        variant === "primary" ? "bg-accent text-on-accent" : "bg-sand text-ink",
      )}
    >
      <Download className="size-4" aria-hidden="true" />
      {t("APK herunterladen")}
    </button>
  );
};

// Страница «Android-App» в браузере (макеты 31 handy-05 · handy-09 · pc-01): APK, три шага, как добавить виджет.
// На ПК слева QR «Mit dem Handy scannen», справа шаги и картинка виджетов; на телефоне — кнопка и ссылка «Lieber als Web-App»
const AndroidDownload = ({ release }) => {
  const t = useT();
  const inPanel = useInSettingsPanel();
  const installHow = useInstallPrompt(); // «prompt» — браузер умеет поставить сайт как приложение
  const label = releaseLabel(release, document.documentElement.lang || "de");

  const asWebApp = async () => {
    if (await promptInstall()) toast.success(translate("ORBook ist jetzt installiert"));
  };

  const steps = (
    <>
      <ListCard title={t("Installieren")}>
        <Step number={1} label={t("Datei *öffnen*")} icon={Download} />
        <Step number={2} label={t("*„Installation erlauben“*")} icon={ShieldCheck} />
        <Step number={3} label={t("ORBook *öffnen und anmelden*")} icon={AppIcon} />
      </ListCard>
      <ListCard title={t("Widget")}>
        <Step number={1} label={t("Startbildschirm *lange drücken*")} icon={Pointer} />
        <Step number={2} label={t("*Widgets → ORBook*")} icon={LayoutGrid} />
      </ListCard>
    </>
  );

  return (
    <div className="flex flex-col gap-4.5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
      {/* телефон: значок, версия, кнопка · ПК: QR на телефон и кнопка поменьше */}
      <section className="flex flex-col gap-4 rounded-card bg-card p-4 lg:items-center lg:gap-5 lg:p-6">
        <div className="flex items-center gap-4 lg:hidden">
          <span className="grid size-15 shrink-0 place-items-center rounded-block bg-tint">
            <OrbitMark className="size-11" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-subhead font-black text-ink">{t("ORBook für Android")}</h2>
            <p className="text-label text-faint">{label}</p>
          </div>
        </div>
        <div className="hidden w-full flex-col items-center gap-5 lg:flex">
          <h2 className="text-subhead font-black text-ink">{t("Mit dem Handy scannen")}</h2>
          <QrCode value={`${window.location.origin}${APK_PATH}`} className="size-60" label={t("QR-Code zum Herunterladen der App")} />
          <p className="text-label text-faint">{label}</p>
        </div>
        <DownloadButton variant={inPanel ? "sand" : "primary"} />
      </section>

      <div className="flex flex-col gap-4.5">
        {steps}
        {installHow === "prompt" && (
          <ListCard className="lg:hidden">
            <MenuRow onClick={asWebApp} icon={Globe} label={t("Lieber als Web-App")} value={t("ohne APK")} />
          </ListCard>
        )}
        <section className="hidden flex-col gap-2.5 lg:flex">
          <h2 className="text-hint font-extrabold text-faint">{t("So sieht es aus")}</h2>
          <WidgetPreview widget={{ kind: "jetzt", cols: 4, rows: 2 }} />
        </section>
      </div>
    </div>
  );
};

export default AndroidDownload;
