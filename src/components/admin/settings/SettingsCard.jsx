import { cn } from "../../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Блок налаштувань. ПК: біла картка з підписом усередині (макет 47).
// Телефон: підпис над блоком; plain — без картки (поля прямо на фоні, як «Schule & Plan» у макеті 45)
// ─────────────────────────────────────────────────────────────
const SettingsCard = ({ title, plain = false, className, children }) => (
  <section className={className}>
    <h2 className="mb-2.5 text-hint font-extrabold text-faint lg:hidden">{title}</h2>
    <div className={cn("lg:rounded-card lg:bg-card lg:px-5 lg:pt-4.5 lg:pb-2", !plain && "rounded-card bg-card px-3.5")}>
      <h2 className="mb-1 hidden text-hint font-extrabold text-faint lg:block">{title}</h2>
      {children}
    </div>
  </section>
);

export default SettingsCard;
