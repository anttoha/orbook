import { cn } from "../../../shared/utils/cn";
import Button from "../../ui/Button";
import { CheckIcon } from "../../ui/icons";

// «Änderungen speichern». ПК — у шапці. Телефон — плаває над нижнім меню, лише коли є зміни.
// label — свій текст («Speichern · 2 Änderungen» у Muster)
export const SaveButton = ({ busy, dirty, onSave, floating = false, label = "Änderungen speichern" }) => {
  if (floating && !dirty) return null;
  return (
    <Button variant="primary" disabled={busy || !dirty} onClick={onSave} className={cn("flex-none px-5", floating && "fixed inset-x-4 bottom-24 z-20 shadow-menu lg:hidden")}>
      <CheckIcon className="size-4" /> {busy ? "Wird gespeichert…" : label}
    </Button>
  );
};

export default SaveButton;
