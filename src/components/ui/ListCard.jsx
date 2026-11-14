// Підпис і біла картка з рядками, розділеними лінією: Mehr, Darstellung, Meine Kurse.
// hint — сірий текст праворуч від підпису («Seiten … weitere Bereiche der App», частина 22)
import { GlassCard } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { useT } from "../../shared/hooks/useT";

const ListCard = ({ title, hint, className, children }) => {
  const t = useT();
  const glass = useGlass();
  const list = <ul className={glass ? "divide-y divide-hair" : "divide-y divide-hair rounded-card bg-card px-3.5 py-0.5"}>{children}</ul>;
  return (
  <section className={className}>
    {title && (
      <h2 className="mb-2.5 flex items-baseline justify-between gap-3 text-hint font-extrabold text-faint">
        {t(title)}
        {hint && <span className="truncate text-caption font-normal">{t(hint)}</span>}
      </h2>
    )}
    {/* «Glas»: стеклянная карточка библиотеки (преломляет то, что под ней), углы — наш токен */}
    {glass ? <GlassCard padding="2px 14px" radius="var(--radius-card)">{list}</GlassCard> : list}
  </section>
  );
};

export default ListCard;
