import { Outlet } from 'react-router-dom'
import { useLanguage } from './shared/store/languageStore'

const App = () => {
  // key: при смене языка страница строится заново — так обновятся и даты, которые считаются вне React
  const lang = useLanguage((s) => s.lang)
  return (
    <div className='min-h-screen bg-paper'>
      <Outlet key={lang} />
    </div>
  )
}

export default App
