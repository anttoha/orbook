import { useNavigate } from "react-router-dom";
import Sheet from "../ui/Sheet";
import WeekPicker from "../week/WeekPicker";

// ─────────────────────────────────────────────────────────────
// Шторка «Woche wählen» (телефон). Адреса: ?sheet=kalender&kw=2026-10-05
// На ПК календар відкривається випадаючим вікном біля кнопки 📅 (WeekPickerPopover).
// ─────────────────────────────────────────────────────────────
const WeekPickerSheet = ({ open, onClose, sheet }) => {
  const navigate = useNavigate(); // перехід на тиждень

  return (
    <Sheet open={open} onClose={onClose} desktop="dialog" title="Woche wählen">
      {/* key — при новому відкритті календар починається з переданого тижня */}
      <WeekPicker
        key={sheet.kw}
        initialWeek={sheet.kw}
        // перехід на тиждень (параметри шторки йдуть з адреси — вона закриється)
        onOpenWeek={(monday) => navigate(`/woche?woche=${monday}`)}
      />
    </Sheet>
  );
};

export default WeekPickerSheet;
