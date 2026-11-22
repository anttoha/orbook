import AenderungenBlock from "./AenderungenBlock";
import AufgabenBlock from "./AufgabenBlock";
import BlockBoundary from "./BlockBoundary";
import CountdownBlock from "./CountdownBlock";
import HeuteBlock from "./HeuteBlock";
import JetztBlock from "./JetztBlock";
import KartenBlock from "./KartenBlock";
import LerntimerBlock from "./LerntimerBlock";
import MaterialienBlock from "./MaterialienBlock";
import NotizenBlock from "./NotizenBlock";
import StatistikBlock from "./StatistikBlock";
import NotenBlock from "./NotenBlock";
import TermineBlock from "./TermineBlock";
import TestsBlock from "./TestsBlock";
import WocheBlock from "./WocheBlock";

// Вид блока → компонент. Новый блок = компонент + строка здесь + строка в BLOCKS (shared/utils/startBlocks.js)
const COMPONENTS = {
  jetzt: JetztBlock,
  heute: HeuteBlock,
  woche: WocheBlock,
  tests: TestsBlock,
  aufgaben: AufgabenBlock,
  aenderungen: AenderungenBlock,
  termine: TermineBlock,
  notizen: NotizenBlock,
  materialien: MaterialienBlock,
  statistik: StatistikBlock,
  noten: NotenBlock,
  countdown: CountdownBlock,
  karteikarten: KartenBlock,
  lerntimer: LerntimerBlock,
};

// Один блок «Start» в своей границе ошибок. editing — режим «Anpassen» (без ссылок)
const StartBlock = ({ block, editing = false }) => {
  const Block = COMPONENTS[block.kind];
  return <BlockBoundary>{Block && <Block block={block} editing={editing} />}</BlockBoundary>;
};

export default StartBlock;
