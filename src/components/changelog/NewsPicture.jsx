import Switch from "../ui/Switch";

// Картинка к записи — маленькая «сценка» из настоящих элементов приложения, а не скриншот:
// она сама меняет цвета в тёмной теме. Ключ — поле picture у записи в shared/changelog.js.
const AlleKurse = () => (
  <div aria-hidden="true" className="rounded-card bg-tint p-3.5">
    <div className="flex items-center justify-between">
      <span className="text-label font-bold text-accent-ink">Alle Kurse zeigen</span>
      <Switch checked />
    </div>
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      <span className="h-10 rounded-field bg-mathe-tint px-2 pt-1.5 text-hint font-extrabold text-mathe-text">Mathe</span>
      {/* gestrichelt = Kurs, den du nicht hast */}
      <span className="h-10 rounded-field border border-dashed border-faint2 px-2 pt-1.5 text-hint font-extrabold text-faint">Physik</span>
      <span className="h-10 rounded-field bg-englisch-tint px-2 pt-1.5 text-hint font-extrabold text-englisch-text">Englisch</span>
    </div>
  </div>
);

const PICTURES = { alleKurse: AlleKurse };

const NewsPicture = ({ name }) => {
  const Picture = PICTURES[name];
  return Picture ? <Picture /> : null; // неизвестный ключ или нет картинки — блок просто не показываем
};

export default NewsPicture;
