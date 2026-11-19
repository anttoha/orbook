import { useAndroidStore } from "../store/androidStore";
import { isAndroidBrowser } from "../utils/android";
import { useAndroidOffer } from "./useAndroidOffer";

// «ORBook für Android» вверху Mehr (макет 31 handy-06): только в браузере на Android, пока не закрыто ✕.
// Заменяет карточку «ORBook als App» — две подряд были бы лишними
export const useAndroidCard = () => {
  const { offer } = useAndroidOffer();
  const dismissed = useAndroidStore((s) => s.cardDismissed);
  return offer && !dismissed && isAndroidBrowser();
};
