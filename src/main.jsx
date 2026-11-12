import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './shared/router/router'
import { startPwa } from './shared/utils/serviceWorker'

startPwa() // часть 17: sw.js (уведомления) и «Installieren»

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
