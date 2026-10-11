// Лінія «зараз» у сітці тижня (телефон). Кладеться в той самий рядок сітки, що й поточний урок,
// і розтягується на всі дні. progress — скільки уроку минуло (0…1) → відступ зверху.
// dayCount — скільки днів у сітці (5 або 7 з вихідними)
const NowLine = ({ row, progress, todayIndex, dayCount = 5 }) => {
  return (
    <div
      className="pointer-events-none relative z-10"
      style={{ gridRow: row, gridColumn: `2 / ${dayCount + 2}` }} // від першого дня до останнього
    >
      <div className="absolute inset-x-0" style={{ top: `${progress * 100}%` }}>
        {/* тонка лінія через увесь тиждень */}
        <div className="h-px -translate-y-1/2 bg-accent/60" />

        {/* кружечок + товстий відрізок у колонці сьогоднішнього дня */}
        {todayIndex >= 0 && (
          <div className="absolute inset-x-0 top-0 grid gap-1" style={{ gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))` }}>
            <div className="relative" style={{ gridColumn: todayIndex + 1 }}>
              <div className="absolute inset-x-0 top-0 h-[3px] -translate-y-1/2 rounded-full bg-accent" />
              <div className="absolute top-0 -left-1 size-2.5 -translate-y-1/2 rounded-full bg-accent" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NowLine;
