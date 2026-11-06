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

// Кнопка фільтра: воронка
export const FilterIcon = ({ className }) => <Outline d="M4 5h16l-6 8v6l-4-2v-4z" className={className} />;

// «Nur Fach, Datum, Stunde und Thema»: щит
export const ShieldIcon = ({ className }) => <Outline d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" className={className} />;

// Editor-Code: ключ (кружечок і стрижень)
export const KeyIcon = ({ className }) => <Outline d="M8 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM11 12l9-9M17 6l3 3" className={className} />;

// «Klasse verlassen»: двері зі стрілкою
export const LeaveIcon = ({ className }) => <Outline d="M14 8V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-3M10 12h10m0 0l-3-3m3 3l-3 3" className={className} />;

// Кнопка WhatsApp: бульбашка зі слухавкою
export const WhatsappIcon = ({ className }) => <Outline d="M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z" className={className} />;

// «Löschen»: кошик
export const TrashIcon = ({ className }) => <Outline d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" className={className} />;

// «Speichern»: галочка
export const CheckIcon = ({ className }) => <Outline d="M5 12l5 5 9-10" className={className} />;

// «Bearbeiten»: олівець
export const PencilIcon = ({ className }) => <Outline d="M4 20h4L19 9l-4-4L4 16v4z" className={className} />;

// Три стовпчики: «Statistik» (меню і екран «Noch zu wenig Daten»)
export const StatsIcon = ({ className }) => <Outline d="M5 20V11M12 20V5M19 20v-8" className={className} />;

// Дві стрілки по колу: «synchronisiert», кнопка «Verbinden»
export const SyncIcon = ({ className }) => <Outline d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5" className={className} />;

// Одна стрілка по колу: «Neuen Code erzeugen»
export const RenewIcon = ({ className }) => <Outline d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" className={className} />;

// Два аркуші: «Code kopieren»
export const CopyIcon = ({ className }) => <Outline d="M11 9h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM5 15V6a1 1 0 0 1 1-1h9" className={className} />;

// Трикутник зі знаком оклику: «Code weg = Notizen weg»
export const WarningIcon = ({ className }) => <Outline d="M12 4l9 16H3zM12 10v4M12 17h.01" className={className} />;

// Замочок: «Nur für dich …»
export const LockIcon = ({ className }) => <Outline d="M7 11h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3" className={className} />;

// Календар: дата нотатки
export const CalendarIcon = ({ className }) => <Outline d="M6 5h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM8 3v4M16 3v4M3 10h18" className={className} />;
