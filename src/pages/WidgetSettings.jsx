import { useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import { androidWidget, closeWidget, saveWidget } from "../shared/api/android";
import { useT } from "../shared/hooks/useT";
import { useClasses } from "../shared/store/classesStore";
import { BACKGROUNDS, LOOKS, cellsLabel, parseWidget, widgetClass } from "../shared/utils/widgetSnapshot";
import WidgetKindList from "../components/android/WidgetKindList";
import WidgetPreview from "../components/android/WidgetPreview";
import SettingRow from "../components/more/SettingRow";
import Button from "../components/ui/Button";
import ListCard from "../components/ui/ListCard";
import RoundButton from "../components/ui/RoundButton";
import RowSwitch from "../components/ui/RowSwitch";
import Segmented from "../components/ui/Segmented";

// «9b · Geschwister» — имя класса и своё название на устройстве, если оно есть
const classLabel = (item) => (item.label?.trim() ? `${item.name} · ${item.label.trim()}` : item.name);

// ─────────────────────────────────────────────────────────────
// «Widget einstellen» (часть 31b, макет 31 handy-04). Открывается в Android-App:
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
  const back = () => (first ? closeWidget() : navigate("/mehr/android"));
  const done = () => {
    saveWidget(id, draft);
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

      {classes.length > 1 && (
        <section>
          <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Klasse")}</h2>
          <Segmented label={t("Klasse")} options={classes.map((item) => ({ value: item.id, label: classLabel(item) }))} value={draft.classId} onChange={(classId) => change({ classId })} />
        </section>
      )}

      <WidgetKindList value={draft.kind} onChange={(kind) => change({ kind })} />

      <ListCard title={t("Anzeige")}>
        <li className="flex">
          <RowSwitch checked={draft.mine} onToggle={() => change({ mine: !draft.mine })} label={t("Nur meine Kurse")} className="flex h-14.5 flex-1 items-center justify-between gap-3 text-left">
            <span className="text-row text-ink">{t("Nur meine Kurse")}</span>
          </RowSwitch>
        </li>
        <SettingRow label={t("Aussehen")}>
          <Segmented label={t("Aussehen")} size="form" className="w-60" options={LOOKS} value={draft.look} onChange={(look) => change({ look })} />
        </SettingRow>
        <SettingRow label={t("Hintergrund")}>
          <Segmented label={t("Hintergrund")} size="form" className="w-60" options={BACKGROUNDS} value={draft.background} onChange={(background) => change({ background })} />
        </SettingRow>
      </ListCard>

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
