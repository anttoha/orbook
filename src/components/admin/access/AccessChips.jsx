import { audienceChip, hasLink, isFull } from "../../../shared/utils/accessCodes";
import { codeChip } from "../../../shared/utils/admin";
import Badge from "../../ui/Badge";

// Чипи коду: GRUPPE (фіолетовий) або PERSÖNLICH (пісочний); ще GESPERRT/ABGELAUFEN, якщо не діє.
// withStatus — телефон (на ПК статус окремою колонкою)
export const AudienceChip = ({ audience }) => <Badge variant={audience === "person" ? "soft" : "changed"}>{audienceChip(audience)}</Badge>;

const STATUS = { locked: "off", expired: "danger" };

export const StatusChip = ({ code }) => <Badge variant={STATUS[code.status] ?? "ok"}>{codeChip(code)}</Badge>;

// VOLL — ліміт пристроїв вичерпано: нові пристрої не увійдуть
export const FullChip = ({ code }) => (isFull(code) ? <Badge variant="changed">Voll</Badge> : null);

// LINK — у коду працює посилання-запрошення (частина 16)
export const LinkChip = ({ code }) => (hasLink(code) ? <Badge variant="ok">Link</Badge> : null);

export const CodeChips = ({ code }) => (
  <>
    <AudienceChip audience={code.audience} />
    {code.status !== "ok" ? <StatusChip code={code} /> : <FullChip code={code} />}
    <LinkChip code={code} />
  </>
);
