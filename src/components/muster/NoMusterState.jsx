import { CalendarDays, Layers } from "lucide-react";
import Button from "../ui/Button";
import StateScreen from "../ui/StateScreen";

// «Noch kein Muster» (макет 19 handy-10): тиждень попереду, плану немає,
// а Muster ще не з чого зібрати (початок навчального року). onToday — до поточного тижня
const NoMusterState = ({ onToday }) => (
  <StateScreen icon={Layers} title="Noch kein Muster" text="ORBook baut das Muster aus den echten Plänen der letzten Wochen. Nach zwei Schulwochen ist es da.">
    <Button variant="primary" className="flex-none" onClick={onToday}>
      <CalendarDays className="size-4.5" /> Zur aktuellen Woche
    </Button>
  </StateScreen>
);

export default NoMusterState;
