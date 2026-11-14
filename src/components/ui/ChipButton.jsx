import { GlassButton } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { layoutOnly } from "../../shared/utils/glassLayout";

// Чип-кнопка: предмет в фильтре Tests, вид теста, срок, урок в форме.
// on — выбран ли. look — прежний вид (Soft и Klar).
// «Glas» (часть 30a): кнопка библиотеки liquid-glass — выбранная залита акцентом, остальные стеклянные
const ChipButton = ({ on, look, children, ...props }) => {
  const glass = useGlass();
  if (glass) {
    return (
      <GlassButton size="sm" variant={on ? "filled" : "glass"} tint="var(--color-accent)" className={layoutOnly(look)} {...props}>
        {children}
      </GlassButton>
    );
  }
  return (
    <button type="button" className={look} {...props}>
      {children}
    </button>
  );
};

export default ChipButton;
