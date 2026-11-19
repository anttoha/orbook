import { useEffect } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { cancelUpdate, installUpdate, onAndroidEvent } from "../../shared/api/android";
import { useAndroidStore } from "../../shared/store/androidStore";
import { updateErrorText } from "../../shared/utils/android";
import ChangeGroups from "../changelog/ChangeGroups";
import DownloadProgress from "../android/DownloadProgress";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import { useT } from "../../shared/hooks/useT";

// «Update ist da» (часть 31a, макеты 31 handy-07 и handy-08): только в Android-App.
// Что нового — notes с сервера (те же группы, что в «Was ist neu»). «Aktualisieren» — приложение
// качает APK и открывает установщик Android; ход загрузки приходит событиями orbook-android.
const UpdateSheet = ({ open, onClose }) => {
  const t = useT();
  const release = useAndroidStore((s) => s.release);
  const download = useAndroidStore((s) => s.download);
  const setDownload = useAndroidStore((s) => s.setDownload);

  // Подписка на события приложения, пока окно открыто
  useEffect(() => {
    if (!open) return undefined;
    return onAndroidEvent((event) => {
      if (event.type === "download") {
        setDownload({ loaded: event.loaded, total: event.total });
        return;
      }
      setDownload(null);
      if (event.type === "done") onClose(); // дальше — окно установщика Android
      const text = event.type === "error" ? updateErrorText(event.reason) : null;
      if (text) toast.error(text);
    });
  }, [open, onClose, setDownload]);

  if (!release) return null;

  const start = () => {
    setDownload({ loaded: 0, total: release.size });
    installUpdate();
  };
  // Закрыли окно во время загрузки — загрузку тоже останавливаем
  const close = () => {
    if (download) cancelUpdate();
    setDownload(null);
    onClose();
  };

  const footer = download ? (
    <Button onClick={close}>{t("Abbrechen")}</Button>
  ) : (
    <>
      <Button onClick={close}>{t("Später")}</Button>
      <Button variant="primary" onClick={start}>
        <Download className="size-4" />
        {t("Aktualisieren")}
      </Button>
    </>
  );

  return (
    <Sheet open={open} onClose={close} desktop="dialog" eyebrow={t("Version {version}", { version: release.versionName })} title={t("Update ist da")} footer={footer}>
      <div className="flex flex-col gap-6">
        <ChangeGroups entry={release.notes} />
        {download && <DownloadProgress loaded={download.loaded} total={download.total} />}
      </div>
    </Sheet>
  );
};

export default UpdateSheet;
