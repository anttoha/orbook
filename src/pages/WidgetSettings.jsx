import { useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import { androidWidget, closeWidget, saveWidget } from "../shared/api/android";
import { useT } from "../shared/hooks/useT";
import { useClasses } from "../shared/store/classesStore";
import { cellsLabel, configToSave, isNotenKind, parseWidget, widgetClass } from "../shared/utils/widgetConfig";
import WidgetBehaviour from "../components/android/WidgetBehaviour";
import WidgetKindGrid from "../components/android/WidgetKindGrid";
import WidgetLook from "../components/android/WidgetLook";
import WidgetPreview from "../components/android/WidgetPreview";
import WidgetShow from "../components/android/WidgetShow";
import Button from "../components/ui/Button";
import RoundButton from "../components/ui/RoundButton";
import Segmented from "../components/ui/Segmented";

// «9b · Geschwister» — имя класса и своё название на устройстве, если оно есть
const classLabel = (item) => (item.label?.trim() ? `${item.name} · ${item.label.trim()}` : item.name);

// ─────────────────────────────────────────────────────────────
// «Widget einstellen» (часть 31b; с 31d — макет 31d handy-12/13: плитки видов, свои строки у каждого вида,
// Aussehen и Verhalten). Открывается в Android-App:
//   • сразу, когда виджет кладут на рабочий стол (?neu=1, WidgetConfigActivity) — ✕ отменяет виджет;
//   • из «Android-App → Widgets auf diesem Handy» — ✕ просто назад.
// Настройку хранит приложение (ORBookAndroid.saveWidget), сайт её только показывает и меняет.
// ─────────────────────────────────────────────────────────────
const WidgetSettings = () => {
  const t = useT();
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const first = params.get("neu") === "1";
  const classes = useClasses((s) => s.list).filter((item) => !item.gone);
  const activeId = useClasses((s) => s.activeId);
  const [draft, setDraft] = useState(() => {
    const saved = parseWidget(androidWidget(id));
    return saved && { ...saved, classId: widgetClass(saved, classes, activeId) };
  });

  if (!draft) return <Navigate to="/mehr" replace />; // в браузере (без моста) этой страницы нет

  const change = (patch) => setDraft((old) => ({ ...old, ...patch }));
  const noten = isNotenKind(draft.kind); // оценки с телефона: ни класса, ни «Verhalten»
  const back = () => (first ? closeWidget() : navigate("/mehr/android"));
  const done = () => {
    saveWidget(id, configToSave(draft));
    if (!first) navigate("/mehr/android"); // при первой настройке экран закроет само приложение
  };

  return (
    <div className="flex flex-col gap-5.5 pb-24">
      <header className="flex items-center gap-3">
        <RoundButton onClick={back} aria-label={t("Schließen")}>
          <X className="size-4.5" />
        </RoundButton>
        <div className="min-w-0">
          <p className="text-hint font-extrabold text-faint">
            {t("Widget")} · {cellsLabel(draft)}
          </p>
          <h1 className="truncate text-heading text-ink">{t("Einstellen")}</h1>
        </div>
      </header>

      <WidgetPreview widget={draft} />

      <WidgetKindGrid value={draft.kind} onChange={(kind) => change({ kind })} />

      {!noten && classes.length > 1 && (
        <section>
          <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Klasse")}</h2>
          <Segmented label={t("Klasse")} options={classes.map((item) => ({ value: item.id, label: classLabel(item) }))} value={draft.classId} onChange={(classId) => change({ classId })} />
        </section>
      )}

      <WidgetShow draft={draft} change={change} />
      <WidgetLook draft={draft} change={change} />
      {!noten && <WidgetBehaviour draft={draft} change={change} />}

      {/* «Fertig» прилипает к низу экрана */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-hair bg-paper px-gutter pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button variant="primary" onClick={done} className="h-14 w-full text-row">
          <Check className="size-4.5" />
          {t("Fertig")}
        </Button>
      </div>
    </div>
  );
};

export default WidgetSettings;
