import { Navigate } from "react-router-dom";
import { usePlanStore } from "../shared/store/planStore";
import { useUserStore } from "../shared/store/userStore";
import Week from "./Week";

// Адреса «/»: те, що вибрано в Darstellung → Startansicht.
// Кілька класів і жоден не «Beim Start öffnen» — спершу «Meine Klassen» (частина 29)
const StartPage = () => {
  const startView = useUserStore((s) => s.startView);
  const startPage = usePlanStore((s) => s.startPage);
  if (startPage) return <Navigate to={startPage} replace />;
  return startView === "heute" ? <Navigate to="/heute" replace /> : <Week />;
};

export default StartPage;
