import { useSubjectName } from "../../shared/hooks/useKarten";
import { groupDecks } from "../../shared/utils/karten";
import DeckRow from "./DeckRow";

// Стопки по предметам (макет 43 handy-01): «Englisch», «Biologie» … и «Ohne Fach» в конце.
// Строки поднимаются по очереди (index — сквозной номер)
const DeckList = ({ decks, today, selected }) => {
  const nameOf = useSubjectName();
  let index = 0;
  return groupDecks(decks).map((group) => (
    <section key={group.subject ?? "-"} className="flex flex-col gap-2">
      <h2 className="mb-0.75 text-hint font-extrabold text-faint">{nameOf(group.subject)}</h2>
      {group.decks.map((deck) => (
        <DeckRow key={deck.id} deck={deck} today={today} selected={deck.id === selected} index={index++} />
      ))}
    </section>
  ));
};

export default DeckList;
