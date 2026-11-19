import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { androidApp } from "../shared/api/android";
import { retryText } from "../shared/api/api";
import { useSheet } from "../shared/hooks/useSheet";
import { useAndroidStore } from "../shared/store/androidStore";
import { isNewer } from "../shared/utils/android";
import { cn } from "../shared/utils/cn";
import Button from "../components/ui/Button";
import OrbitMark from "../components/ui/OrbitMark";
import PageHeader from "../components/ui/PageHeader";
import { useT } from "../shared/hooks/useT";

// «Android-App» внутри APK (часть 31a, макет 31 handy-10 без виджетов — они в 31b).
// В браузере страницы пока нет (31c добавит APK, шаги и QR) — уходим в «Mehr».
const AndroidApp = () => {
  const t = useT();
  const [app] = useState(androidApp); // установленная версия не меняется, пока страница открыта
  const { openSheet } = useSheet();
  const release = useAndroidStore((s) => s.release);
  const checking = useAndroidStore((s) => s.checking);
  const check = useAndroidStore((s) => s.check);

  // Открыли страницу, а сегодня ещё не спрашивали сервер — спросим тихо, чтобы показать «aktuell»
  useEffect(() => {
    if (app && useAndroidStore.getState().release === undefined) check().catch(() => {});
  }, [app, check]);

  if (!app) return <Navigate to="/mehr" replace />;

  const newer = isNewer(app, release);
  const search = async () => {
    try {
      const fresh = await check();
      if (isNewer(app, fresh)) openSheet("update");
    } catch (error) {
      toast.error(retryText(error));
    }
  };

  return (
    <div className="flex flex-col gap-4.5">
      <PageHeader backTo="/mehr" eyebrow={t("Mehr")} title={t("Android-App")} />
      <section className="flex flex-col gap-4 rounded-card bg-card p-4">
        <div className="flex items-center gap-4">
          <span className="grid size-15 shrink-0 place-items-center rounded-block bg-tint">
            <OrbitMark className="size-11" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-subhead font-black text-ink">{t("ORBook für Android")}</h2>
            <p className={cn("flex items-center gap-1.5 text-label font-bold", newer ? "text-accent-ink" : "text-ok")}>
              <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", newer ? "bg-accent" : "bg-ok")} />
              {newer
                ? t("Update {version} ist da", { version: release.versionName })
                : release !== undefined
                  ? t("Installiert · {version} · aktuell", { version: app.versionName })
                  : t("Installiert · {version}", { version: app.versionName })}
            </p>
          </div>
        </div>
        {newer ? (
          <Button variant="primary" className="flex-none" onClick={() => openSheet("update")}>
            {t("Aktualisieren")}
          </Button>
        ) : (
          <Button className="flex-none" onClick={search} disabled={checking}>
            <RefreshCw className={cn("size-4", checking && "motion-safe:animate-spin")} />
            {t("Nach Update suchen")}
          </Button>
        )}
      </section>
    </div>
  );
};

export default AndroidApp;
