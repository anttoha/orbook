import { useId } from "react";

// Круглый флаг для выбора языка (упрощённый рисунок). Цвета — токены flag-* из index.css
const Flag = ({ code, className = "size-5.5" }) => {
  const clip = useId();
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`shrink-0 ${className}`}>
      <clipPath id={clip}>
        <circle cx="12" cy="12" r="11.5" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        {code === "de" && (
          <>
            <rect width="24" height="8" className="fill-flag-black" />
            <rect y="8" width="24" height="8" className="fill-flag-red" />
            <rect y="16" width="24" height="8" className="fill-flag-gold" />
          </>
        )}
        {code === "en" && (
          <>
            <rect width="24" height="24" className="fill-flag-navy" />
            <path d="M0 0L24 24M24 0L0 24" strokeWidth="4.8" className="stroke-flag-white" />
            <path d="M0 0L24 24M24 0L0 24" strokeWidth="1.7" className="stroke-flag-red" />
            <path d="M12 0V24M0 12H24" strokeWidth="8" className="stroke-flag-white" />
            <path d="M12 0V24M0 12H24" strokeWidth="4.8" className="stroke-flag-red" />
          </>
        )}
        {code === "uk" && (
          <>
            <rect width="24" height="12" className="fill-flag-blue" />
            <rect y="12" width="24" height="12" className="fill-flag-yellow" />
          </>
        )}
      </g>
      <circle cx="12" cy="12" r="11.5" fill="none" strokeWidth="1" className="stroke-ink/20" />
    </svg>
  );
};

export default Flag;
