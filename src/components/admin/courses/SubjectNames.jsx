import { shownName } from "../../../shared/utils/admin";
import { badgeCode } from "../../../shared/utils/format";

// «Fächer»: код предмета і поле з назвою. Порожнє поле — у застосунку видно код («Kein Name — „TW“»).
// edited — { [code]: текст } з чернетки; поля, яких ще не чіпали, показують поточну назву
const SubjectNames = ({ subjects, edited, onChange }) => (
  <ul className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-x-3">
    {subjects.map((subject) => (
      <li key={subject.code} className="flex items-center gap-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-tint text-label font-extrabold text-accent-ink" title={subject.code}>
          {badgeCode(subject.code)}
        </span>
        <input
          aria-label={`Name für ${subject.code}`}
          value={edited[subject.code] ?? shownName(subject)}
          placeholder={`Kein Name — „${subject.code}“`}
          maxLength={60}
          onChange={(event) => onChange(subject.code, event.target.value)}
          className="h-12 min-w-0 flex-1 rounded-field bg-paper px-4 text-input text-ink outline-none placeholder:text-faint2 focus:ring-2 focus:ring-accent/30"
        />
      </li>
    ))}
  </ul>
);

export default SubjectNames;
