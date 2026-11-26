// «Oft gebraucht» в шторке «Mitnehmen» (часть 50b): только быстрые подсказки,
// главное — своё поле. Ключ — код предмета из плана; нет предмета в списке — общие.
// Тексты — немецкие ключи словаря (t() переводит, свой текст пользователя остаётся как есть)
const SPRACHEN = ["Wörterbuch", "Vokabelheft", "Lektüre"];
const NATUR = ["Taschenrechner", "Laborkittel", "Schutzbrille"];

export const PACK_HINTS = {
  Sp: ["Sportsachen", "Duschzeug", "Turnschuhe", "Trinkflasche"],
  Ku: ["Pinsel", "Schere", "Kleber", "Malkasten", "Zeichenblock"],
  Ma: ["Taschenrechner", "Geodreieck", "Zirkel"],
  Mu: ["Flöte", "Notenheft"],
  En: SPRACHEN,
  Fr: SPRACHEN,
  Sn: SPRACHEN,
  La: SPRACHEN,
  De: ["Lektüre", "Duden"],
  Ph: NATUR,
  Ch: NATUR,
  Bio: NATUR,
  Bi: NATUR,
  NT: NATUR,
};

export const COMMON_HINTS = ["Heft", "Buch", "Mappe"];

// Подсказки предмета на языке экрана (tr — t из useT) без уже добавленных вещей
export function hintsFor(code, taken = [], tr = (text) => text) {
  const own = new Set(taken.map((x) => tr(x).toLocaleLowerCase("de")));
  return (PACK_HINTS[code] ?? COMMON_HINTS).map(tr).filter((hint) => !own.has(hint.toLocaleLowerCase("de")));
}
