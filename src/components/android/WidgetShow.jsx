import { WIDGET_ROWS } from "../../shared/utils/widgetConfig";
import ListCard from "../ui/ListCard";
import { ChoiceRow, SwitchRow } from "./WidgetRows";

// Варианты выбора: значение — как в widgetConfig.js, подпись — немецкий текст (Segmented переводит сам)
const APP = { value: "app", label: "Wie App" };
const CHOICES = {
  subject: { label: "Fach", options: [APP, { value: "kuerzel", label: "Kürzel" }, { value: "name", label: "Name" }] },
  place: { label: "Raum · Lehrkraft", options: [APP, { value: "raum", label: "Raum" }, { value: "beides", label: "Beides" }] },
  cancelled: { label: "Ausfall", options: [APP, { value: "ausblenden", label: "Ausblenden" }] },
  weekend: { label: "Am Wochenende", options: [{ value: "next", label: "Nächste Woche" }, { value: "leer", label: "Leer" }] },
  cell: { label: "In der Zelle", options: [{ value: "kuerzel", label: "Kürzel" }, { value: "raum", label: "+ Raum" }, { value: "lehrkraft", label: "+ Lehrkraft" }] },
  testsDays: { label: "Voraus", options: [{ value: 7, label: "1 Woche" }, { value: 14, label: "2 Wochen" }, { value: 0, label: "Alle" }] },
  sort: { label: "Sortieren nach", options: [{ value: "faellig", label: "Fällig" }, { value: "fach", label: "Fach" }] },
  changes: { label: "Zeitraum", options: [{ value: "heute", label: "Heute" }, { value: "morgen", label: "+ Morgen" }, { value: "woche", label: "Woche" }] },
  termineDays: { label: "Voraus", options: [{ value: 30, label: "1 Monat" }, { value: 90, label: "3 Monate" }, { value: 0, label: "Alle" }] },
  count: { label: "Zählen", options: [{ value: "schultage", label: "Schultage" }, { value: "tage", label: "Tage" }] },
};
const SWITCHES = {
  mine: "Nur meine Kurse",
  onlyChanges: "Nur Änderungen",
  evening: "Abends schon morgen",
  next: "Danach zeigen",
  progress: "Fortschritt",
  showDone: "Erledigte zeigen",
  showGrades: "Noten anzeigen", // часть 39: иначе «•••» — виджет видит любой, кто смотрит на телефон
};

// «Anzeige»: у каждого вида свои строки (WIDGET_ROWS). У «Notizen» строк нет — карточки тоже нет
const WidgetShow = ({ draft, change }) => {
  const rows = WIDGET_ROWS[draft.kind] ?? [];
  if (!rows.length) return null;
  return (
    <ListCard title="Anzeige">
      {rows.map((key) =>
        SWITCHES[key] ? (
          <SwitchRow key={key} label={SWITCHES[key]} checked={draft[key]} onToggle={() => change({ [key]: !draft[key] })} />
        ) : (
          <ChoiceRow key={key} label={CHOICES[key].label} options={CHOICES[key].options} value={draft[key]} onChange={(value) => change({ [key]: value })} />
        ),
      )}
    </ListCard>
  );
};

export default WidgetShow;
