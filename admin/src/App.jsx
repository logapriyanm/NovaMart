import { Routes, Route, Navigate } from "react-router-dom"
import Add from "./pages/Add"
import List from "./pages/List"
import Orders from "./pages/Orders"
import Dashboard from "./pages/Dashboard"
import { useState, useEffect } from "react"
import Login from "./components/Login"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

// Import components
import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"

// Import other pages
import Customers from "./pages/Customers"
import Settings from "./pages/Settings"

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₹'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          {/* Navbar - Full width */}
          <Navbar setToken={setToken} toggleSidebar={toggleSidebar} />
          
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          
          {/* Main Content */}
          <main className="pt-16 lg:pl-64 min-h-screen">
            <div className="p-2">
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard token={token} />} />
                
                {/* Products */}
                <Route path="/products" element={<List token={token} />} />
                <Route path="/add-product" element={<Add token={token} />} />
                
                {/* Orders */}
                <Route path="/orders" element={<Orders token={token} />} />
                
                {/* Customers */}
                <Route path="/customers" element={<Customers token={token} />} />
                
                {/* Settings */}
                <Route path="/settings" element={<Settings token={token} />} />
              </Routes>
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default App