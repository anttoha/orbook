// Рядок налаштування: назва (і підказка під нею) ліворуч, перемикач праворуч
const SettingRow = ({ label, hint, children }) => (
  <li className="flex h-16.75 items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-row text-ink">{label}</p>
      {hint && <p className="mt-0.5 text-caption text-faint">{hint}</p>}
    </div>
    {children}
  </li>
);

export default SettingRow;
