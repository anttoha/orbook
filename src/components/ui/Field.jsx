// Підпис і поле під ним: «Art», «Fächer», «Zeitraum»
const Field = ({ label, error, children }) => (
  <div>
    <p className="mb-2.25 text-hint font-extrabold text-faint">{label}</p>
    {children}
    {error && (
      <p role="alert" className="mt-1.5 text-hint text-danger">
        {error}
      </p>
    )}
  </div>
);

export default Field;
