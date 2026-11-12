import { isMajorType } from "../../shared/utils/entries";
import Badge from "../ui/Badge";

// Вид записи: Klassenarbeit (и старая «Klausur») — фиолетовый бейдж, остальные — песочный
const ExamBadge = ({ type }) => <Badge variant={isMajorType(type) ? "exam" : "soft"}>{type}</Badge>;

export default ExamBadge;
