// Ошибка формы над кнопкой (когда она не относится к одному полю). Пусто — ничего не рисуем
const ErrorText = ({ children }) =>
  children ? (
    <p role="alert" className="text-label font-extrabold text-danger motion-safe:animate-deck-shake">
      {children}
    </p>
  ) : null;

export default ErrorText;
