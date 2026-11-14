import { useEffect, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { copyText, loadShareText, whatsappUrl } from "../../shared/utils/share";
import { cn } from "../../shared/utils/cn";
import { CheckIcon, WhatsappIcon } from "../ui/icons";
import { Skeleton } from "../ui/PlanState";
import Button from "../ui/Button";
import Segmented from "../ui/Segmented";
import Sheet from "../ui/Sheet";
import PillButton from "../ui/PillButton";

// Варіанти перемикача: значення в адресі → range для сервера
const RANGES = [
  { value: "heute", label: "Heute", range: "today" },
  { value: "morgen", label: "Morgen", range: "tomorrow" },
  { value: "woche", label: "Woche", range: "week" },
];

// ─────────────────────────────────────────────────────────────
// Шторка «Teilen». Адреса: ?sheet=teilen&bereich=morgen[&datum=…][&kw=2026-10-05]
// Текст готує СЕРВЕР (GET /api/share): ми лише вибираємо період і що включити.
// Текст можна поправити і надіслати в WhatsApp або скопіювати.
// ─────────────────────────────────────────────────────────────
const ShareSheet = ({ open, onClose, sheet }) => {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      desktop="dialog"
      eyebrow="Nachricht auf Deutsch"
      title="Teilen"
    >
      {/* key — при новому відкритті з іншими параметрами налаштування починаються заново */}
      <ShareOptions
        key={`${sheet.bereich}-${sheet.datum}-${sheet.kw}`}
        sheet={sheet}
      />
    </Sheet>
  );
};

// Перемикач + галочки + текст
const ShareOptions = ({ sheet }) => {
  const [range, setRange] = useState(
    RANGES.some((r) => r.value === sheet.bereich) ? sheet.bereich : "heute",
  ); // період
  const [includeChanges, setIncludeChanges] = useState(true); // галочка «Vertretungen»
  const [includeExams, setIncludeExams] = useState(true); // галочка «Klausuren»
  const [includeHomework, setIncludeHomework] = useState(true); // галочка «Aufgaben» (часть 27)
  const [result, setResult] = useState({
    status: "loading",
    text: "",
    error: null,
  }); // відповідь сервера
  const [attempt, setAttempt] = useState(0); // «Erneut versuchen» збільшує → запит ще раз

  // Що включити: «Vertretungen» = заміни + скасування + кабінети, «Klausuren» = exams
  const include = [
    ...(includeChanges
      ? ["substitutions", "cancellations", "roomChanges"]
      : []),
    ...(includeExams ? ["exams"] : []),
    ...(includeHomework ? ["homework"] : []),
  ];
  const nothing = include.length === 0; // обидві галочки вимкнені
  const includeKey = include.join(","); // рядок — щоб ефект бачив зміну

  // Від якого дня рахувати: тиждень — понеділок із kw, день — datum (за замовчуванням сервер бере сьогодні)
  const date = range === "woche" ? sheet.kw : sheet.datum;

  // Завантажити текст при кожній зміні налаштувань
  useEffect(() => {
    if (!includeKey) return undefined; // нічого не вибрано — не питаємо сервер
    let cancelled = false; // налаштування змінились, поки чекали — стара відповідь не потрібна
    loadShareText(RANGES.find((r) => r.value === range).range, {
      date: date ?? undefined,
      include: includeKey.split(","),
    })
      .then(
        (text) =>
          !cancelled && setResult({ status: "ready", text, error: null }),
      )
      .catch(
        (error) =>
          !cancelled && setResult({ status: "error", text: "", error }),
      );
    return () => {
      cancelled = true;
    };
  }, [range, date, includeKey, attempt]);

  // Змінити налаштування → показати скелет, поки йде новий текст
  const change = (setter) => (value) => {
    setter(value);
    setResult((r) => ({ ...r, status: "loading" }));
  };

  return (
    <>
      <Segmented
        label="Zeitraum"
        size="form"
        options={RANGES}
        value={range}
        onChange={change(setRange)}
      />

      {/* галочки */}
      <div className="grid grid-cols-2 gap-2">
        <Checkbox
          label="Vertretungen"
          checked={includeChanges}
          onChange={change(setIncludeChanges)}
        />
        <Checkbox
          label="Tests"
          checked={includeExams}
          onChange={change(setIncludeExams)}
        />
        <Checkbox
          label="Aufgaben"
          checked={includeHomework}
          onChange={change(setIncludeHomework)}
        />
      </div>

      {nothing && (
        <p className="rounded-field bg-sand px-3.5 py-3 text-label font-bold text-muted">
          Wähle mindestens eins aus.
        </p>
      )}
      {/* поки йде новий текст — той самий блок, тільки скелет замість тексту: вікно не стрибає по висоті */}
      {!nothing && result.status === "loading" && <Composer loading />}
      {!nothing && result.status === "error" && (
        <div className="flex flex-col items-start gap-2 rounded-field bg-danger-tint px-3.5 py-3 text-label font-bold text-ink">
          <p>Text konnte nicht geladen werden. {result.error.message}</p>
          <PillButton glass="glass" size="sm"
           
            onClick={() => {
              setResult((r) => ({ ...r, status: "loading" }));
              setAttempt((a) => a + 1);
            }} className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-extrabold">
            <RefreshCw className="size-3.5" /> Erneut versuchen
          </PillButton>
        </div>
      )}
      {/* key — новий текст із сервера → поле вводу отримує його заново */}
      {!nothing && result.status === "ready" && (
        <Composer key={result.text} initialText={result.text} />
      )}
    </>
  );
};

// Галочка з підписом
const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex h-10 cursor-pointer items-center gap-3.25 px-1 text-body-sm text-ink">
    {/* справжня галочка лишається для клавіатури і скрінрідера, видно намальовану */}
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      className={cn(
        "grid size-4.5 shrink-0 place-items-center rounded-mark peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50",
        checked ? "bg-accent text-on-accent" : "border-2 border-faint2",
      )}
    >
      {checked && <CheckIcon className="size-3.5" />}
    </span>
    {label}
  </label>
);

// Поле з текстом (можна правити) + кнопки надсилання.
// loading — текст ще вантажиться: на місці поля скелет такої самої висоти, кнопки неактивні
export const Composer = ({ initialText = "", loading = false }) => {
  const [text, setText] = useState(initialText); // текст, який надішлемо

  return (
    <>
      {loading ? (
        <Skeleton className="h-36 rounded-cell" />
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          aria-label="Nachricht"
          className="h-36 w-full resize-none rounded-cell bg-ok-tint px-3.5 py-3 text-body-sm leading-5.25 text-ink outline-none motion-safe:animate-fade-in focus:ring-2 focus:ring-ok/40"
        />
      )}
      <p className="text-caption text-faint">
        Du kannst den Text vor dem Senden noch ändern.
      </p>

      <div className="-mt-1 flex gap-2">
        <Button onClick={() => copyText(text)} disabled={loading}>
          <Copy className="size-4" /> Kopieren
        </Button>
        {/* звичайне посилання в новій вкладці: відкриє WhatsApp (застосунок або web) */}
        <Button
          variant="primary"
          href={loading ? undefined : whatsappUrl(text)}
          disabled={loading}
          target="_blank"
          rel="noreferrer"
        >
          {/* на ПК відкриється WhatsApp Web, тому й підпис такий (як на макеті) */}
          <WhatsappIcon className="size-4" /> WhatsApp
          <span className="hidden lg:inline"> Web</span>
        </Button>
      </div>
    </>
  );
};

export default ShareSheet;
