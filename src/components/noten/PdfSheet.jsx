import { useState } from "react";
import { FileDown, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useT } from "../../shared/hooks/useT";
import { usePdf } from "../../shared/hooks/usePdf";
import { usePlanStore } from "../../shared/store/planStore";
import { paperStand } from "../../shared/utils/notenSheet";
import Button from "../ui/Button";
import RoundButton from "../ui/RoundButton";
import { CheckIcon } from "../ui/icons";
import Sheet from "../ui/Sheet";
import NotenSheet from "./print/NotenSheet";

// Маленькая страница-значок у строки: наш лист (фиолетовый заголовок, плашки) или таблицы InfoPoint
const Mini = ({ kind }) => (
  <span aria-hidden="true" className="flex h-14 w-10 shrink-0 flex-col gap-1 rounded-tag border border-rule bg-qr-bg p-1.5">
    {kind === "orbook" ? (
      <>
        <span className="h-1 w-4.5 rounded-mark bg-qr-ink" />
        <span className="h-1 w-6 rounded-mark bg-qr-eye" />
        <span className="mt-0.5 flex gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="size-1.5 rounded-tick bg-print-sand" />
          ))}
        </span>
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex gap-0.5">
            <span className="h-0.5 flex-1 rounded-tick bg-qr-ink/25" />
            <span className="h-0.5 w-1.5 rounded-tick bg-print-ok-tint" />
          </span>
        ))}
      </>
    ) : (
      <>
        <span className="h-1 w-5.5 rounded-tick bg-qr-ink" />
        <span className="flex flex-1 flex-col border border-qr-ink/70">
          {/* Übersicht — одна таблица с колонкой оценок, Detail — блоки строк */}
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="flex flex-1 border-b border-qr-ink/40 last:border-b-0">
              {kind === "summary" && <span className="w-1/2 border-r border-qr-ink/40" />}
            </span>
          ))}
        </span>
      </>
    )}
  </span>
);

const Choice = ({ kind, title, hint, checked, onPick }) => (
  <button type="button" role="radio" aria-checked={checked} onClick={onPick} className="flex w-full items-center gap-3.5 px-3.5 py-3 text-left outline-none focus-visible:bg-tint">
    <Mini kind={kind} />
    <span className="min-w-0 flex-1">
      <span className="block text-body font-extrabold text-ink">{title}</span>
      <span className="block text-caption text-faint">{hint}</span>
    </span>
    {checked ? (
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-on-accent motion-safe:animate-check-pop">
        <CheckIcon className="size-3.5" />
      </span>
    ) : (
      <span className="size-5.5 shrink-0 rounded-full border-2 border-faint2" />
    )}
  </button>
);

// ─────────────────────────────────────────────────────────────
// Шторка «Als PDF» (макеты 37 handy-04, handy-05): ORBook-лист или оригинал InfoPoint.
// sheet — что напечатать как «ORBook-Blatt» (shared/utils/notenSheet.js); eyebrow — «Noten · 1. Halbjahr»;
// sheetHint — подпись первой строки. Нет пароля для оригинала — переходим на /noten, там вход
// ─────────────────────────────────────────────────────────────
const PdfSheet = ({ open, onClose, eyebrow, sheet, sheetHint, data }) => {
  const t = useT();
  const navigate = useNavigate();
  const me = usePlanStore((s) => s.me);
  const [pick, setPick] = useState("orbook");
  const pdf = usePdf();
  const klass = [me?.className ? t("Klasse {className}", { className: me.className }) : null, me?.schoolName].filter(Boolean).join(" · ");
  const stand = paperStand(data);

  const run = async () => {
    if (pick === "orbook") {
      pdf.sheet(<NotenSheet sheet={sheet} klass={klass} stand={stand} />);
      return onClose();
    }
    const result = await pdf.original(pick);
    if (result === "login") {
      onClose();
      navigate("/noten");
    } else if (result === "done") onClose();
  };

  const choices = [
    { kind: "orbook", title: t("ORBook-Blatt"), hint: sheetHint },
    { kind: "summary", title: t("Original · Übersicht"), hint: t("aus InfoPoint · Zusammenfassung") },
    { kind: "detail", title: t("Original · Alle Noten"), hint: t("aus InfoPoint · Detailansicht") },
  ];
  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        desktop="dialog"
        eyebrow={eyebrow}
        title={t("Als PDF")}
        footer={
          <Button variant="primary" onClick={run} disabled={pdf.busy} className="flex-1">
            {pdf.busy ? <LoaderCircle className="size-4 motion-safe:animate-spin" /> : <FileDown className="size-4" />}
            {pdf.busy ? t("Hole Original …") : t("Als PDF")}
          </Button>
        }
      >
        <div role="radiogroup" aria-label={t("Als PDF")} className="divide-y divide-hair rounded-card bg-card">
          {choices.map((c) => (
            <Choice key={c.kind} {...c} checked={pick === c.kind} onPick={() => setPick(c.kind)} />
          ))}
        </div>
      </Sheet>
      {pdf.area}
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

export default PdfSheet;
