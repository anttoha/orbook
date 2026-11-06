import { useEffect, useState } from "react";

// Значення, що «наздоганяє» value через delay мс після останньої зміни.
// Пошук: запит іде, коли людина перестала друкувати, а не на кожну літеру
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
