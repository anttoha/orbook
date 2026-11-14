import { useLayoutEffect } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { useLanguage } from './shared/store/languageStore'

// Перешли на другую страницу — начинаем сверху (раньше оставалась прокрутка прошлой страницы).
// «Назад»/«вперёд» (POP) не трогаем: там браузер сам возвращает, где был.
// Следим только за путём: шторки (?sheet=…) и переключатели в адресе прокрутку не сбрасывают
function useScrollTopOnPageChange() {
  const { pathname } = useLocation()
  const type = useNavigationType()
  useLayoutEffect(() => {
    if (type !== 'POP') window.scrollTo(0, 0)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps -- тип перехода читаем в момент смены пути
}

const App = () => {
  useScrollTopOnPageChange()
  // key: при смене языка страница строится заново — так обновятся и даты, которые считаются вне React
  const lang = useLanguage((s) => s.lang)
  return (
    <div className='min-h-screen bg-paper'>
      <Outlet key={lang} />
    </div>
  )
}

export default App
