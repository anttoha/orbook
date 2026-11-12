import { CheckIcon } from "../ui/icons";
import QrCode from "../ui/QrCode";
import { PrintFoot, PrintHead, StepDot } from "./PrintBits";

// Что учитель может делать — по правам кода (part 14: create, homework, materials)
function abilities({ className, subjects, rights }) {
  const own = subjects?.length > 0 ? `für ${subjects.join(", ")}` : "für Ihre Fächer";
  return [
    { title: `Den Plan ${className ? `der ${className}` : "der Klasse"} sehen`, text: "wie die Schülerinnen und Schüler, mit allen Kursen" },
    (rights?.create || rights?.homework) && { title: "Tests und Hausaufgaben eintragen", text: `${own} — die Klasse sieht sie sofort` },
    rights?.materials && { title: "Materialien teilen", text: "Links von Google Drive oder OneDrive" },
  ].filter(Boolean);
}

// ─────────────────────────────────────────────────────────────
// Личный лист учителя (макет 25 a4-03): QR с кодом (код после «#», вписывается в поле сам), код, 3 шага, что можно.
// Печатается сразу после «Code erstellen» — код виден только сейчас
// ─────────────────────────────────────────────────────────────
const TeacherSheet = ({ code, url, className, teacher, subjects, rights, printedOn }) => (
  <article className="flex h-a4h w-a4w flex-col bg-white px-16 pt-14 pb-12 text-qr-ink">
    <PrintHead right={className ? `Klasse ${className}` : null} />
    <h1 className="mt-12 text-display">
      Ihr Zugang
      <span className="block text-qr-eye">als Lehrkraft</span>
    </h1>
    <p className="mt-4 text-input text-qr-ink/70">{[teacher && `Für ${teacher}`, subjects?.join(", ")].filter(Boolean).join(" · ")}. Persönlich — bitte nicht weitergeben.</p>
    <div className="mt-8 flex items-center gap-9">
      <div className="rounded-panel bg-qr-ink/5 p-5">
        <QrCode value={url} className="size-64" label="QR-Code mit dem Lehrer-Code" />
      </div>
      <div className="min-w-0">
        <p className="text-label font-extrabold text-qr-ink/55">Lehrer-Code</p>
        <p className="mt-1 text-title font-black tracking-code break-all">{code}</p>
        <ol className="mt-6 space-y-4">
          {[
            ["QR scannen", "Der Code ist dann schon eingetragen."],
            [`Oder: ${new URL(url).host}`, "„Lehrkraft? Mit Lehrer-Code anmelden“"],
            ["„Anmelden“ tippen", "Gilt auf diesem Gerät bis Schuljahresende."],
          ].map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <StepDot n={i + 1} className="size-7 text-label" />
              <div>
                <p className="text-row font-extrabold">{title}</p>
                <p className="text-label text-qr-ink/70">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
    <h2 className="mt-12 text-heading font-black">Was Sie damit können</h2>
    <ul className="mt-4 space-y-2.5">
      {abilities({ className, subjects, rights }).map((item) => (
        <li key={item.title} className="flex items-center gap-3 rounded-field bg-qr-ink/5 px-4.5 py-3.5 text-row">
          <CheckIcon className="size-5 shrink-0 text-qr-eye" />
          <span>
            <b className="font-extrabold">{item.title}</b> <span className="text-qr-ink/70">{item.text}</span>
          </span>
        </li>
      ))}
    </ul>
    <PrintFoot lines={["Code verloren? Der Admin sperrt ihn und gibt Ihnen einen neuen.", `Ausgedruckt am ${printedOn}`]} />
  </article>
);

export default TeacherSheet;
