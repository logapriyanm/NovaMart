// admin/main.jsx - ADD CONTEXT PROVIDER
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { AdminContextProvider } from './context/AdminContext.jsx' // Create this

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AdminContextProvider>
      <App />
    </AdminContextProvider>
  </BrowserRouter>
)