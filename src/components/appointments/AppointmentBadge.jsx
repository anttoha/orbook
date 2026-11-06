import { isFree, kindInfo } from "../../shared/utils/appointments";
import Badge from "../ui/Badge";

// Вид терміну: AUSFLUG, ELTERNABEND, TERMIN — фіолетовий, FREI — зелений
const AppointmentBadge = ({ item }) => <Badge variant={isFree(item) ? "ok" : "changed"}>{kindInfo(item.kind).badge}</Badge>;

export default AppointmentBadge;
