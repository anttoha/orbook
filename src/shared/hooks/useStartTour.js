import { useNavigate } from "react-router-dom";
import { useTourStore } from "../store/tourStore";

// Rundgang (часть 52) из Mehr: сразу первый шаг, без приветствия. Тур всегда начинается на Start
export const useStartTour = () => {
  const navigate = useNavigate();
  return () => {
    navigate("/start");
    useTourStore.getState().begin();
  };
};
