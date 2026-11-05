const MIN_DISTANCE = 60; // пікселів: коротший рух — це не свайп

// "left", "right" або null. Рух переважно вертикальний — це прокрутка, а не свайп.
export function swipeDirection(dx, dy) {
  if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 2) return null;
  return dx < 0 ? "left" : "right";
}
