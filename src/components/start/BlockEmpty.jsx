import { useT } from "../../shared/hooks/useT";

// Короткая строка вместо содержимого: «Nichts offen», «Keine Ferien eingetragen»
const BlockEmpty = ({ text }) => {
  const t = useT();
  return <p className="my-auto text-body-sm font-semibold text-faint">{t(text)}</p>;
};

export default BlockEmpty;
