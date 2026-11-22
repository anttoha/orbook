// Есть ли ещё что прокрутить вверх и вниз (для затухания краёв у прокручиваемого списка).
// 1px запаса: при масштабе экрана scrollTop бывает дробным
export function scrollEdges({ scrollTop, clientHeight, scrollHeight }) {
  return { top: scrollTop > 1, bottom: scrollTop + clientHeight < scrollHeight - 1 };
}

// Класс затухания: снизу, сверху, с обеих сторон или ничего
export function fadeClass({ top, bottom }) {
  if (top && bottom) return "fade-y";
  if (bottom) return "fade-bottom";
  return top ? "fade-top" : "";
}
