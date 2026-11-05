// Контурні іконки з макета, яких немає в lucide (там такі самі за ідеєю, але інші на вигляд).
const Outline = ({ d, className }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

// Перемикач «Zeitleiste»: вісь часу і три смужки різної довжини
export const TimelineIcon = ({ className }) => <Outline d="M4 4v16M4 7h9M4 12h14M4 17h7" className={className} />;

// Klausur: прямий прапорець
export const FlagIcon = ({ className }) => <Outline d="M5 21V4h12l-2 4 2 4H5" className={className} />;
