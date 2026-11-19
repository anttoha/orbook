import { useState } from "react";
import { useChannelText } from "../../../shared/hooks/useChannelText";
import { KINDS } from "../../../shared/utils/channels";
import Segmented from "../../ui/Segmented";
import MessageBubble from "./MessageBubble";
import { useT } from "../../../shared/hooks/useT";

// «So sieht es aus»: настоящий текст с сервера — последний отправленный или собранный сейчас
const MessagePreview = () => {
  const t = useT();
  const [kind, setKind] = useState("plan");
  const { text, loading } = useChannelText(kind);
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-hint font-extrabold text-faint">{t("So sieht es aus")}</h2>
      <Segmented options={KINDS} value={kind} onChange={setKind} label={t("Welche Nachricht")} />
      <MessageBubble text={text} loading={loading} />
    </section>
  );
};

export default MessagePreview;
