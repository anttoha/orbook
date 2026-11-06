// Блок сторінки «Passwörter»: підпис зліва, сіра примітка справа («Seit 10. Sept · vor 12 Tagen»).
// Телефон: поля прямо на фоні (як «Klassenpasswort» у макеті 45). ПК: біла картка (макет 47)
const PasswordSection = ({ title, note, children }) => (
  <section className="lg:rounded-card lg:bg-card lg:px-5 lg:pt-4.5 lg:pb-5">
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <h2 className="text-hint font-extrabold text-faint">{title}</h2>
      {note && <span className="truncate text-caption text-faint">{note}</span>}
    </div>
    {children}
  </section>
);

export default PasswordSection;
