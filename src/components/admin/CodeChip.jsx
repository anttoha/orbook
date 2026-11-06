import { codeChip } from "../../shared/utils/admin";
import Badge from "../ui/Badge";

// Чип стану коду: AKTIV (зелений), GESPERRT (сірий), ABGELAUFEN (червоний)
const VARIANT = { ok: "ok", locked: "off", expired: "danger" };
const CodeChip = ({ code }) => <Badge variant={VARIANT[code.status] ?? "off"}>{codeChip(code)}</Badge>;

export default CodeChip;
