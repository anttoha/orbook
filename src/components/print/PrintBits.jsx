import { cn } from "../../shared/utils/cn";

// Мелкие детали листов A4 (макеты 25 a4-01…03). Только токены qr-* и white: бумага всегда светлая

// Знак ORBook (как OrbitMark), в цветах QR
export const PrintLogo = ({ className }) => (
  <svg viewBox="0 0 76 76" aria-hidden="true" className={className}>
    <ellipse cx="38" cy="38" rx="33" ry="13.5" fill="none" strokeWidth="5" transform="rotate(-28 38 38)" className="stroke-qr-eye" />
    <circle cx="38" cy="38" r="11" className="fill-qr-ink" />
    <circle cx="64" cy="25" r="5.5" className="fill-qr-eye" />
  </svg>
);

// Шапка: знак, «ORBook», справа класс
export const PrintHead = ({ right }) => (
  <header className="flex items-center gap-3">
    <PrintLogo className="size-11" />
    <span className="text-heading font-black">ORBook</span>
    <span className="ml-auto text-row font-bold text-qr-ink/55">{right}</span>
  </header>
);

// Номер шага в фиолетовом кружке
export const StepDot = ({ n, className }) => <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-qr-eye text-row font-black text-white", className)}>{n}</span>;

// Строка внизу листа
export const PrintFoot = ({ lines }) => (
  <footer className="mt-auto flex items-end justify-between border-t border-qr-ink/15 pt-5 text-label text-qr-ink/70">
    <div>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
    <p className="font-bold text-qr-ink/50">Teil von ORBitium</p>
  </footer>
);
