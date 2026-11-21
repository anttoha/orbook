import { useState } from "react";
import { Download, FileDown, LoaderCircle, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../shared/utils/cn";
import { DESKTOP_QUERY, useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { appTooOld, loadOriginal, makePdf, printOriginal, savePdf } from "../../shared/hooks/usePdf";
import { usePrint } from "../../shared/hooks/usePrint";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";
import { usePlanStore } from "../../shared/store/planStore";
import { isOriginal, ORBOOK_VARIANTS, ORIGINAL_VARIANTS, paperStand, pdfName, sheetFor } from "../../shared/utils/notenSheet";
import { toast } from "sonner";
import Button from "../ui/Button";
import ChoiceChips from "../ui/ChoiceChips";
import { CheckIcon } from "../ui/icons";
import RoundButton from "../ui/RoundButton";
import Sheet from "../ui/Sheet";
import PdfPreview from "./PdfPreview";
import NotenSheet from "./print/NotenSheet";

// Подписи вариантов (макет pc-02: название и строка под ним)
const LABELS = {
  1: { get title() { return translate("1. Halbjahr"); }, get hint() { return translate("Noten und Fehlzeiten"); } },
  2: { get title() { return translate("2. Halbjahr"); }, get hint() { return translate("Noten und Fehlzeiten"); } },
  jahr: { get title() { return translate("Schuljahr"); }, get hint() { return translate("beide Halbjahre"); } },
  zeugnis: { get title() { return translate("Zeugnis"); }, get hint() { return translate("Endnoten"); } },
  fehlzeiten: { get title() { return translate("Fehlzeiten"); }, get hint() { return translate("nur Fehlzeiten"); } },
  summary: { get title() { return translate("Übersicht"); }, get hint() { return translate("Zusammenfassung"); } },
  detail: { get title() { return translate("Alle Noten"); }, get hint() { return translate("Detailansicht"); } },
};

// ПК: строка варианта в списке слева
const VariantRow = ({ value, checked, onPick }) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    onClick={() => onPick(value)}
    className={cn("relative flex w-full items-center rounded-field border px-4 py-2 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/50", checked ? "border-accent bg-tint" : "border-transparent bg-card hover:border-rule")}
  >
    <span className="min-w-0 flex-1">
      <span className={cn("block text-row font-extrabold", checked ? "text-accent-ink" : "text-ink")}>{LABELS[value].title}</span>
      <span className={cn("block text-caption", checked ? "text-muted" : "text-faint")}>{LABELS[value].hint}</span>
    </span>
    {checked && (
      <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-accent text-on-accent motion-safe:animate-check-pop">
        <CheckIcon className="size-3" />
      </span>
    )}
  </button>
);

const Group = ({ title, children }) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-hint font-extrabold text-faint">{title}</h3>
    {children}
  </section>
);

// ─────────────────────────────────────────────────────────────
// Окно «Als PDF» (часть 37 v2, макеты handy-06…08, pc-02, pc-03).
// Варианты: лист ORBook (1./2. Halbjahr, Schuljahr, Zeugnis, Fehlzeiten) или оригинал InfoPoint
// (Übersicht, Alle Noten — подгружается при выборе). Превью — настоящий лист. «Drucken» — окно печати,
// «Herunterladen» — файл PDF. start — вариант при открытии (вкладка Noten или «fehlzeiten»)
// ─────────────────────────────────────────────────────────────
const PdfDialog = ({ open, onClose, data, start }) => {
  const t = useT();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const me = usePlanStore((s) => s.me);
  const [variant, setVariant] = useState(start);
  const [originals, setOriginals] = useState({}); // mode → { loading } | { html } | { error }
  const [preview, setPreview] = useState(null); // DOM листа в превью — с него делаем PDF
  const [saving, setSaving] = useState(false);
  const { print, area } = usePrint();

  const klass = [me?.className ? t("Klasse {className}", { className: me.className }) : null, me?.schoolName].filter(Boolean).join(" · ");
  const original = isOriginal(variant) ? originals[variant] : null;
  const sheet = isOriginal(variant) ? null : sheetFor(data, variant);
  const element = sheet ? <NotenSheet sheet={sheet} klass={klass} stand={paperStand(data)} /> : null;
  const ready = sheet ? Boolean(preview) : Boolean(original?.html && preview);

  const fetchOriginal = async (mode) => {
    setOriginals((prev) => ({ ...prev, [mode]: { loading: true } }));
    const result = await loadOriginal(mode);
    if (result.error === "login") {
      onClose();
      navigate("/noten");
      return;
    }
    setOriginals((prev) => ({ ...prev, [mode]: result }));
  };

  const pick = (value) => {
    setVariant(value);
    setPreview(null);
    if (isOriginal(value) && !originals[value]?.html && !originals[value]?.loading) fetchOriginal(value);
  };

  const onPrint = () => {
    if (appTooOld()) return toast(t("Für PDF bitte die App aktualisieren"));
    if (sheet) print(element);
    else if (original?.html) printOriginal(original.html);
  };

  const onDownload = async () => {
    if (appTooOld()) return toast(t("Für PDF bitte die App aktualisieren"));
    setSaving(true);
    try {
      await savePdf(await makePdf(preview, { margin: sheet ? 0 : 12 }), pdfName(data, variant));
    } catch {
      toast(t("PDF ging gerade nicht – versuch es nochmal"));
    } finally {
      setSaving(false);
    }
  };

  const view = <PdfPreview key={variant} element={element} original={original} onRetry={() => fetchOriginal(variant)} onReady={setPreview} />;
  const footer = (
    <>
      {isDesktop && <p className="mr-auto self-center truncate text-label font-semibold text-faint">{pdfName(data, variant)}</p>}
      <Button onClick={onPrint} disabled={!ready} className={isDesktop ? "flex-none px-6" : "flex-1"}>
        <Printer className="size-4" /> {t("Drucken")}
      </Button>
      <Button variant="primary" onClick={onDownload} disabled={!ready || saving} className={isDesktop ? "flex-none px-6" : "flex-1"}>
        {saving ? <LoaderCircle className="size-4 motion-safe:animate-spin" /> : <Download className="size-4" />} {t("Herunterladen")}
      </Button>
    </>
  );

  return (
    <>
      <Sheet open={open} onClose={onClose} desktop="pdf" eyebrow={[t("Noten"), me?.className ? t("Klasse {className}", { className: me.className }) : null].filter(Boolean).join(" · ")} title={t("Als PDF")} footer={footer}>
        {isDesktop ? (
          <div className="flex gap-6">
            <div role="radiogroup" aria-label={t("Als PDF")} className="flex w-75 shrink-0 flex-col gap-4">
              <Group title="ORBook">
                {ORBOOK_VARIANTS.map((v) => (
                  <VariantRow key={v} value={v} checked={variant === v} onPick={pick} />
                ))}
              </Group>
              <Group title={t("Original aus InfoPoint")}>
                {ORIGINAL_VARIANTS.map((v) => (
                  <VariantRow key={v} value={v} checked={variant === v} onPick={pick} />
                ))}
              </Group>
            </div>
            <div className="min-w-0 flex-1">{view}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {view}
            <Group title="ORBook">
              <ChoiceChips options={ORBOOK_VARIANTS.map((v) => ({ value: v, label: LABELS[v].title }))} value={variant} onChange={pick} label="ORBook" />
            </Group>
            <Group title={t("Original aus InfoPoint")}>
              <ChoiceChips options={ORIGINAL_VARIANTS.map((v) => ({ value: v, label: LABELS[v].title }))} value={variant} onChange={pick} label="Original aus InfoPoint" />
            </Group>
          </div>
        )}
      </Sheet>
      {area}
    </>
  );
};

// Круглая кнопка в шапке (телефон, handy-01) или «Als PDF» с подписью (ПК, pc-01)
export const PdfButton = ({ onClick, wide }) => {
  const t = useT();
  if (!wide) {
    return (
      <RoundButton onClick={onClick} aria-label={t("Als PDF")}>
        <FileDown className="size-4.5" />
      </RoundButton>
    );
  }
  return (
    <Button onClick={onClick} className="h-9 flex-none px-4 text-body-sm">
      <FileDown className="size-4" /> {t("Als PDF")}
    </Button>
  );
};

export default PdfDialog;
