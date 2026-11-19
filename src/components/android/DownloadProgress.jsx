import { useLanguage } from "../../shared/store/languageStore";
import { megabytes, percentOf } from "../../shared/utils/android";
import { useT } from "../../shared/hooks/useT";

// «Wird geladen … 4,1 von 6,4 MB» и полоса (макет 31 handy-08)
const DownloadProgress = ({ loaded, total }) => {
  const t = useT();
  const lang = useLanguage((s) => s.lang);
  const percent = percentOf(loaded, total);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-body-sm font-bold text-ink">{t("Wird geladen …")}</span>
        <span className="text-label text-faint">
          {t("{loaded} von {total} MB", { loaded: megabytes(loaded, lang), total: megabytes(total, lang) })}
        </span>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 overflow-hidden rounded-full bg-sand">
        <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default DownloadProgress;
