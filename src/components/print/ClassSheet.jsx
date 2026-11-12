import { cn } from "../../shared/utils/cn";
import { shortUrl } from "../../shared/utils/invite";
import QrCode from "../ui/QrCode";
import { PrintFoot, PrintHead, PrintLogo, StepDot } from "./PrintBits";

const STEPS = [
  { title: "Kamera öffnen und QR scannen", text: "Oder den Link oben eintippen." },
  { title: "Deine Kurse antippen", text: "Nur einmal — ändern geht unter Mehr." },
  { title: "Fertig: Plan, Tests, Aufgaben", text: "Tipp: auf den Home-Bildschirm legen." },
];

// ─────────────────────────────────────────────────────────────
// Лист для класса (макеты 25 a4-01, a4-02): kind = "aushang" — один большой QR для доски,
// "kaertchen" — 8 карточек на листе, разрезать и раздать. На листе только ссылка-приглашение, без имён.
// ─────────────────────────────────────────────────────────────
const ClassSheet = ({ kind, url, className, steps }) => (kind === "kaertchen" ? <Cards url={url} className={className} /> : <Poster url={url} className={className} steps={steps} />);

const Poster = ({ url, className, steps }) => (
  <article className="flex h-a4h w-a4w flex-col bg-white px-16 pt-14 pb-12 text-qr-ink">
    <PrintHead right={className ? `Klasse ${className}` : null} />
    <h1 className="mt-12 text-display">
      Unser Stundenplan
      <span className="block text-qr-eye">aufs Handy</span>
    </h1>
    <p className="mt-4 text-input text-qr-ink/70">Vertretungen, Tests und Hausaufgaben{className ? ` der ${className}` : ""} — immer aktuell.</p>
    <div className="mt-8 grid place-items-center rounded-panel bg-qr-ink/5 py-6">
      <QrCode value={url} className="size-90" label="QR-Code zum Einladungslink" />
    </div>
    <p className="mt-6 text-center text-heading font-black text-qr-eye">{shortUrl(url)}</p>
    {steps && (
      <ol className="mt-8 grid grid-cols-3 gap-6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="rounded-card bg-qr-ink/5 p-4.5">
            <StepDot n={i + 1} />
            <p className="mt-4 text-row font-extrabold">{step.title}</p>
            <p className="mt-1.5 text-label text-qr-ink/70">{step.text}</p>
          </li>
        ))}
      </ol>
    )}
    <PrintFoot lines={["Kein Konto, keine E-Mail, keine Namen.", "Fragen? Admin der Klasse. Bitte nur in der Klasse aufhängen."]} />
  </article>
);

// 2 × 4 карточки, между ними пунктир для ножниц
const Cards = ({ url, className }) => (
  <article className="grid h-a4h w-a4w grid-cols-2 grid-rows-4 bg-white text-qr-ink">
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} className={cn("flex items-center gap-5 border-dashed border-qr-ink/25 px-7", i % 2 === 0 && "border-r", i < 6 && "border-b")}>
        <QrCode value={url} className="size-44 shrink-0" label="QR-Code zum Einladungslink" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-row font-black">
            <PrintLogo className="size-6" /> ORBook
          </p>
          <p className="mt-2 text-heading font-black">{className ? `Klasse ${className}` : "Unsere Klasse"}</p>
          <p className="text-label text-qr-ink/70">Plan, Tests, Aufgaben</p>
          <ol className="mt-3 space-y-0.5 text-label font-bold">
            {["Scannen", "Kurse antippen", "Fertig"].map((text, n) => (
              <li key={text}>
                <span className="font-black text-qr-eye">{n + 1}</span> {text}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-caption font-extrabold break-all text-qr-eye">{shortUrl(url)}</p>
        </div>
      </div>
    ))}
  </article>
);

export default ClassSheet;
