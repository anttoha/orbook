import ListCard from "../ui/ListCard";

// Блок «Pflicht» або «Wahl»: підпис і картка з рядками. Порожню групу не показуємо.
const CourseGroup = ({ title, children }) => {
  if (!children.length) return null;
  return <ListCard title={title}>{children}</ListCard>;
};

export default CourseGroup;
