import { Navigate } from "react-router-dom";
import { useUserStore } from "../shared/store/userStore";
import Week from "./Week";

// Адреса «/»: те, що вибрано в Darstellung → Startansicht
const StartPage = () => {
  const startView = useUserStore((s) => s.startView);
  return startView === "heute" ? <Navigate to="/heute" replace /> : <Week />;
};

export default StartPage;
