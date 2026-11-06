import { nextExamCard } from "../../shared/utils/exams";

// ─────────────────────────────────────────────────────────────
// Фіолетова картка над календарем (ПК, макет 14):
//   2   Tage bis
//       Klausur Mathe
//       Fr, 19. Sept · 1. Stunde
// exam — найближча Klausur; onOpen — відкрити її вікно
// ─────────────────────────────────────────────────────────────
const ExamCountdownCard = ({ exam, onOpen }) => {
  const card = nextExamCard(exam);
  return (
    <button type="button" onClick={onOpen} className="flex h-23.5 w-full items-center gap-4 rounded-card bg-accent px-4.5 text-left text-on-accent transition-shadow hover:shadow-raise">
      {card.number !== null && <span className="text-countdown-pc">{card.number}</span>}
      <span className="min-w-0">
        <span className="block text-hint font-extrabold text-today-sub">{card.eyebrow}</span>
        <span className="mt-0.5 block truncate text-input font-bold">{card.title}</span>
        <span className="mt-0.5 block truncate text-hint">{card.when}</span>
      </span>
    </button>
  );
};

export default ExamCountdownCard;
