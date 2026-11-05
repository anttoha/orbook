// Знак ORBook з макета: планета й орбіта. Розмір задається ззовні: className="size-13.5"
const OrbitMark = ({ className }) => (
  <svg viewBox="0 0 76 76" fill="none" aria-hidden="true" className={className}>
    <ellipse cx="38" cy="38" rx="33" ry="13.5" strokeWidth="2.6" transform="rotate(-28 38 38)" className="stroke-accent" />
    <circle cx="38" cy="38" r="11" className="fill-ink" />
    <circle cx="64" cy="25" r="4.5" className="fill-accent" />
  </svg>
);

export default OrbitMark;
