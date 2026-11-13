import { translate } from "../i18n/translate";
import { useLanguage } from "../store/languageStore";

// t("Mehr") → «More» / «Ще». Подписка на язык: при смене языка компонент перерисуется
export const useT = () => {
  useLanguage((s) => s.lang);
  return translate;
};
