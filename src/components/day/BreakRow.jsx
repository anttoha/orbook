// Розділювач «Pause · 20 min» між уроками: підпис на рівні назви предмета, далі пунктирна лінія.
const BreakRow = ({ minutes }) => (
  <div className="flex h-5.5 items-center gap-1.5 pl-13.5 text-room font-extrabold text-faint2">
    Pause · {minutes} min
    <span className="h-0 flex-1 border-t border-dashed border-rule" />
  </div>
);

export default BreakRow;
