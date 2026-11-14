// Есть ли ниже ещё что-то, ради чего стоит листать (часть 29d: кнопка «вниз»).
// box — { scrollTop, scrollHeight, clientHeight }; min — сколько пикселей «хвоста» считается «есть ещё»
// onlyAtTop — показывать только пока не начали листать (страницы: дальше кнопка мешала бы)
export function moreBelow({ scrollTop, scrollHeight, clientHeight }, { min = 64, onlyAtTop = false } = {}) {
  const rest = scrollHeight - scrollTop - clientHeight;
  if (rest <= min) return false;
  return !onlyAtTop || scrollTop < 40;
}

// На сколько листать по нажатию: почти на экран, чтобы последняя строка осталась видна
export const scrollStep = (clientHeight) => Math.round(clientHeight * 0.8);
