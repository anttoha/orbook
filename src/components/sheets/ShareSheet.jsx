import { useEffect, useState } from "react";
import { Copy, MessageCircle, RefreshCw } from "lucide-react";
import { copyText, loadShareText, whatsappUrl } from "../../shared/utils/share";
import { Skeleton } from "../ui/PlanState";
import Button from "../ui/Button";
import Segmented from "../ui/Segmented";
import Sheet from "../ui/Sheet";

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
    <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow="Nachricht auf Deutsch" title="Teilen">
      {/* key — при новому відкритті з іншими параметрами налаштування починаються заново */}
      <ShareOptions key={`${sheet.bereich}-${sheet.datum}-${sheet.kw}`} sheet={sheet} />
    </Sheet>
  );
};

// Перемикач + галочки + текст
const ShareOptions = ({ sheet }) => {
  const [range, setRange] = useState(RANGES.some((r) => r.value === sheet.bereich) ? sheet.bereich : "heute"); // період
  const [includeChanges, setIncludeChanges] = useState(true); // галочка «Vertretungen»
  const [includeExams, setIncludeExams] = useState(true); // галочка «Klausuren»
  const [result, setResult] = useState({ status: "loading", text: "", error: null }); // відповідь сервера
  const [attempt, setAttempt] = useState(0); // «Erneut versuchen» збільшує → запит ще раз

  // Що включити: «Vertretungen» = заміни + скасування + кабінети, «Klausuren» = exams
  const include = [...(includeChanges ? ["substitutions", "cancellations", "roomChanges"] : []), ...(includeExams ? ["exams"] : [])];
  const nothing = include.length === 0; // обидві галочки вимкнені
  const includeKey = include.join(","); // рядок — щоб ефект бачив зміну

  // Від якого дня рахувати: тиждень — понеділок із kw, день — datum (за замовчуванням сервер бере сьогодні)
  const date = range === "woche" ? sheet.kw : sheet.datum;

  // Завантажити текст при кожній зміні налаштувань
  useEffect(() => {
    if (!includeKey) return undefined; // нічого не вибрано — не питаємо сервер
    let cancelled = false; // налаштування змінились, поки чекали — стара відповідь не потрібна
    loadShareText(RANGES.find((r) => r.value === range).range, { date: date ?? undefined, include: includeKey.split(",") })
      .then((text) => !cancelled && setResult({ status: "ready", text, error: null }))
      .catch((error) => !cancelled && setResult({ status: "error", text: "", error }));
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
      <Segmented label="Zeitraum" options={RANGES} value={range} onChange={change(setRange)} />

      {/* галочки */}
      <div className="grid grid-cols-2 gap-2">
        <Checkbox label="Vertretungen" checked={includeChanges} onChange={change(setIncludeChanges)} />
        <Checkbox label="Klausuren" checked={includeExams} onChange={change(setIncludeExams)} />
      </div>

      {nothing && <p className="rounded-2xl bg-sand px-3.5 py-3 text-label font-bold text-muted">Wähle mindestens eins aus.</p>}
      {!nothing && result.status === "loading" && <Skeleton className="h-36" />}
      {!nothing && result.status === "error" && (
        <div className="flex flex-col items-start gap-2 rounded-2xl bg-danger-tint px-3.5 py-3 text-label font-bold text-ink">
          <p>Text konnte nicht geladen werden. {result.error.message}</p>
          <button
            type="button"
            onClick={() => {
              setResult((r) => ({ ...r, status: "loading" }));
              setAttempt((a) => a + 1);
            }}
            className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-extrabold"
          >
            <RefreshCw className="size-3.5" /> Erneut versuchen
          </button>
        </div>
      )}
      {/* key — новий текст із сервера → поле вводу отримує його заново */}
      {!nothing && result.status === "ready" && <Composer key={result.text} initialText={result.text} />}
    </>
  );
};

// Галочка з підписом
const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl bg-card px-3.5 py-3 text-body-sm font-bold text-ink">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="size-4.5 accent-accent" // accent-* фарбує системну галочку
    />
    {label}
  </label>
);

// Поле з текстом (можна правити) + кнопки надсилання
const Composer = ({ initialText }) => {
  const [text, setText] = useState(initialText); // текст, який надішлемо

  return (
    <>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        aria-label="Nachricht"
        className="w-full resize-none rounded-2xl bg-ok-tint p-3.5 text-body-sm leading-relaxed font-bold text-ink outline-none focus:ring-2 focus:ring-ok/40"
      />
      <p className="-mt-2 px-1 text-caption font-bold text-faint">Du kannst den Text vor dem Senden noch ändern.</p>

      <div className="flex gap-2.5">
        <Button onClick={() => copyText(text)}>
          <Copy className="size-4.5" /> Kopieren
        </Button>
        {/* звичайне посилання в новій вкладці: відкриє WhatsApp (застосунок або web) */}
        <a
          href={whatsappUrl(text)}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-body font-extrabold text-on-accent active:opacity-80"
        >
          {/* на ПК відкриється WhatsApp Web, тому й підпис такий (як на макеті) */}
          <MessageCircle className="size-4.5" /> WhatsApp<span className="hidden lg:inline"> Web</span>
        </a>
      </div>
    </>
  );
};

export default ShareSheet;
