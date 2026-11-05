import { cn } from "../../shared/utils/cn";

// Значення, яке школа могла змінити: нове виділене, старе закреслене («Kle ~~Mü~~»).
// change — lesson.changes.teacher / .room або undefined. Старого кабінету школа зазвичай не повідомляє
// (old: null), але новий кабінет усе одно виділяємо.
const ChangedValue = ({ value, change, oldClassName }) => (
  <>
    <span className={cn(change && "font-bold text-accent-ink")}>{value ?? "—"}</span>
    {change?.old && <s className={cn("text-faint", oldClassName)}>{change.old}</s>}
  </>
);

export default ChangedValue;
