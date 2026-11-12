import { useState } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import Button from "../ui/Button";
import { CheckIcon } from "../ui/icons";
import Switch from "../ui/Switch";
import ClassSheet from "./ClassSheet";
import { usePrint } from "../../shared/hooks/usePrint";

// Строка «Blatt für die Klasse drucken» в окне «Einladen» (макет 25 handy-10)
export const PrintRow = ({ onClick }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-card border border-accent bg-card px-3.5 py-3 text-left outline-none transition-[background-color,scale] duration-150 hover:bg-tint focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-98">
    <Printer className="size-5 shrink-0 text-accent-ink" />
    <span className="min-w-0 flex-1">
      <span className="block text-row font-bold text-accent-ink">Blatt für die Klasse drucken</span>
      <span className="block text-caption text-faint">A4 · Aushang oder Kärtchen zum Verteilen</span>
    </span>
    <ChevronRight className="size-4 shrink-0 text-faint2" />
  </button>
);

const KINDS = [
  { kind: "aushang", title: "Aushang", hint: "1 großer QR" },
  { kind: "kaertchen", title: "Kärtchen", hint: "8 zum Ausschneiden" },
];

// Маленький схематичный лист в карточке выбора
const MiniSheet = ({ kind }) => (
  <span className={cn("mx-auto grid h-34 w-24 rounded-tile border border-rule bg-white p-2", kind === "kaertchen" ? "grid-cols-2 grid-rows-4 gap-1" : "content-start gap-1.5")}>
    {kind === "kaertchen" ? (
      Array.from({ length: 8 }, (_, i) => <span key={i} className="rounded-tag bg-qr-ink/15" />)
    ) : (
      <>
        <span className="h-2 w-3/5 rounded-full bg-qr-ink" />
        <span className="h-1.5 w-4/5 rounded-full bg-qr-ink/20" />
        <span className="mx-auto mt-1 size-13 rounded-tag bg-qr-ink/15 ring-2 ring-qr-eye/60" />
        {[0, 1, 2].map((n) => (
          <span key={n} className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-qr-eye" />
            <span className="h-1 flex-1 rounded-full bg-qr-ink/20" />
          </span>
        ))}
      </>
    )}
  </span>
);

// ─────────────────────────────────────────────────────────────
// «Blatt drucken» (макеты 25 handy-11, pc-03): вид листа, «Kurze Anleitung», потом окно печати браузера.
// Внутри окна «Einladen» — onBack возвращает к QR. На ПК справа уменьшенный настоящий лист
// ─────────────────────────────────────────────────────────────
const PrintChooser = ({ url, className, onBack }) => {
  const [kind, setKind] = useState("aushang");
  const [steps, setSteps] = useState(true);
  const { print, area } = usePrint();
  const sheet = <ClassSheet kind={kind} url={url} className={className} steps={steps} />;

  return (
    <div className="flex flex-col gap-4 motion-safe:animate-rise-in">
      <button type="button" onClick={onBack} className="-mt-2 -ml-1 flex min-h-11 items-center gap-1 self-start rounded-full px-1 text-hint font-extrabold text-muted hover:text-ink">
        <ChevronLeft className="size-3.5" /> Zurück zu Link und QR
      </button>
      <div className="flex gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div role="radiogroup" aria-label="Art des Blatts" className="grid grid-cols-2 gap-2">
            {KINDS.map((item) => (
              <button
                key={item.kind}
                type="button"
                role="radio"
                aria-checked={kind === item.kind}
                onClick={() => setKind(item.kind)}
                className={cn("relative flex flex-col gap-3 rounded-card border px-3 pt-4 pb-3.5 text-center outline-none transition-[background-color,border-color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-97", kind === item.kind ? "border-accent bg-tint" : "border-transparent bg-card hover:border-rule")}
              >
                {kind === item.kind && (
                  <span className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full bg-accent text-on-accent motion-safe:animate-check-pop">
                    <CheckIcon className="size-3.5" />
                  </span>
                )}
                <MiniSheet kind={item.kind} />
                <span>
                  <span className={cn("block text-row font-extrabold", kind === item.kind ? "text-accent-ink" : "text-ink")}>{item.title}</span>
                  <span className="block text-caption text-faint">{item.hint}</span>
                </span>
              </button>
            ))}
          </div>
          {kind === "aushang" && (
            <div className="flex items-center gap-3 rounded-card bg-card px-3.5 py-3.5">
              <span className="min-w-0 flex-1">
                <span className="block text-row text-ink">Kurze Anleitung aufs Blatt</span>
                <span className="block text-caption text-faint">3 Schritte: scannen, Kurse wählen, fertig</span>
              </span>
              <Switch checked={steps} onChange={setSteps} label="Kurze Anleitung aufs Blatt" />
            </div>
          )}
          <p className="text-caption text-faint">Auf dem Blatt steht nur der Einladungslink — keine Namen. Link aus = Blatt geht nicht mehr.</p>
        </div>
        {/* ПК: настоящий лист, уменьшенный (zoom меняет и место в разметке, не только картинку) */}
        <div aria-hidden="true" className="hidden shrink-0 rounded-card bg-sand p-3 lg:block">
          <div key={`${kind}-${steps}`} className="overflow-hidden shadow-raise motion-safe:animate-fade-in" style={{ zoom: 0.3 }}>
            {sheet}
          </div>
        </div>
      </div>
      <Button variant="primary" onClick={() => print(sheet)} className="flex-none">
        <Printer className="size-4" /> Drucken
      </Button>
      <p className="-mt-2 text-center text-caption text-faint">Öffnet das Druckfenster — dort geht auch „Als PDF speichern“.</p>
      {area}
    </div>
  );
};

export default PrintChooser;
