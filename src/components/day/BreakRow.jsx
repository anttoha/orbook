// Розділювач «Pause · 20 min» між уроками.
// inline — варіант для ПК: підпис зліва, далі пунктирна лінія (як на макеті)
const BreakRow = ({ minutes, inline = false }) =>
  inline ? (
    <div className="flex items-center gap-3 pl-[68px] text-micro font-bold text-faint">
      Pause · {minutes} min
      <span className="h-0 flex-1 border-t border-dashed border-rule" />
    </div>
  ) : (
    <div className="flex items-center gap-3 pl-14 text-small font-bold text-faint">
      <span className="h-px flex-1 bg-hair" />
      Pause · {minutes} min
      <span className="h-px flex-1 bg-hair" />
    </div>
  );

export default BreakRow;
