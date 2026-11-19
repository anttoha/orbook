import { useState } from "react";
import { useChannelText } from "../../../shared/hooks/useChannelText";
import { KINDS } from "../../../shared/utils/channels";
import Segmented from "../../ui/Segmented";
import Sheet from "../../ui/Sheet";
import { Composer } from "../../sheets/ShareSheet";
import { useT } from "../../../shared/hooks/useT";

// «Nachricht teilen» (макет 27 handy-06): тот же текст, что в Telegram, — в WhatsApp или скопировать
const ShareTextSheet = ({ open, onClose }) => {
  const t = useT();
  return (
  <Sheet open={open} onClose={onClose} desktop="dialog" eyebrow="WhatsApp" title={t("Nachricht teilen")}>
    {open && <ShareBody />}
  </Sheet>
);
};

const ShareBody = () => {
  const t = useT();
  const [kind, setKind] = useState("tomorrow");
  const { text, loading } = useChannelText(kind);
  return (
    <>
      <Segmented options={KINDS} value={kind} onChange={setKind} label={t("Welche Nachricht")} />
      {/* key — новый текст с сервера попадает в поле заново */}
      <Composer key={`${kind}-${loading}`} loading={loading} initialText={text ?? ""} />
    </>
  );
};

export default ShareTextSheet;
