import Select from "./Select";

// Маленький випадаючий список-«пігулка»: «5 min ⌄», «9b ⌄» (макети 45 і 47).
// Тепер це наш Select (свій список замість системного). options — [{ value, label }]
const SelectPill = (props) => <Select variant="pill" {...props} />;

export default SelectPill;
