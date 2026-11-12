import { useMemo } from "react";
import { cn } from "../../shared/utils/cn";
import { qrFor } from "../../shared/utils/qr";

const QUIET = 3; // тихий край навколо коду (у клітинках): без нього камера гірше знаходить код

// ─────────────────────────────────────────────────────────────
// QR-код у стилі ORBook (макет 16-einladen): крапки, фіолетові «очі», знак ORBook у центрі.
// Кольори — токени qr-*: однакові в обох темах, бо камера читає темне на білому.
// Розмір задається ззовні: className="size-42"
// ─────────────────────────────────────────────────────────────
const QrCode = ({ value, className, dim = false, label = "QR-Code zum Einladungslink" }) => {
  const { size, dots, eyes, logo } = useMemo(() => qrFor(value), [value]); // рахуємо лише при новому посиланні
  const box = size + QUIET * 2;
  const at = (n) => n + QUIET; // клітинка → координата в SVG
  const logoSize = logo.to - logo.from + 1;

  return (
    <svg viewBox={`0 0 ${box} ${box}`} role="img" aria-label={label} className={cn("rounded-field", dim && "opacity-15", className)}>
      <rect width={box} height={box} className="fill-qr-bg" />
      {/* одна path з кружечків: тисяча окремих <circle> гальмувала б */}
      <path className="fill-qr-ink" d={dots.map(([x, y]) => `M${at(x) + 0.06} ${at(y) + 0.5}a.44 .44 0 1 0 .88 0a.44 .44 0 1 0 -.88 0`).join("")} />
      {eyes.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={at(x) + 0.5} y={at(y) + 0.5} width="6" height="6" rx="1.2" fill="none" strokeWidth="1" className="stroke-qr-eye" />
          <rect x={at(x) + 2} y={at(y) + 2} width="3" height="3" rx=".6" className="fill-qr-ink" />
        </g>
      ))}
      {/* знак ORBook (як OrbitMark) на білому квадраті */}
      <rect x={at(logo.from)} y={at(logo.from)} width={logoSize} height={logoSize} rx={logoSize * 0.28} className="fill-qr-bg" />
      <g transform={`translate(${at(logo.from) + logoSize * 0.1} ${at(logo.from) + logoSize * 0.1}) scale(${(logoSize * 0.8) / 76})`}>
        <ellipse cx="38" cy="38" rx="33" ry="13.5" fill="none" strokeWidth="5" transform="rotate(-28 38 38)" className="stroke-qr-eye" />
        <circle cx="38" cy="38" r="11" className="fill-qr-ink" />
        <circle cx="64" cy="25" r="5.5" className="fill-qr-eye" />
      </g>
    </svg>
  );
};

export default QrCode;
