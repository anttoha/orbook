import Badge from "../ui/Badge";

// Вид запису: Klausur — фіолетовий бейдж, Test і Abgabe — пісочний
const ExamBadge = ({ type }) => <Badge variant={type === "Klausur" ? "exam" : "soft"}>{type}</Badge>;

export default ExamBadge;
