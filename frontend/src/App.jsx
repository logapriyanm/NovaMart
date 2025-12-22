import './index.css'
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import { useState, useContext } from 'react'
import { ShopContext } from './context/ShopContext'

// User Pages
import Home from "./pages/Home"
import Collection from "./pages/Collection"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Product from "./pages/Product"
import Cart from "./pages/Cart"
import Login from "./pages/Login"
import PlaceOrder from "./pages/PlaceOrder"
import Verify from './pages/Verify'
import Profile from './pages/Profile/Profile'
import NotFound from './pages/NotFound';

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import Add from './pages/admin/Add'
import List from './pages/admin/List'
import Orders from './pages/admin/Orders'
import Customers from './pages/admin/Customers'
import Settings from './pages/admin/Settings'
import Sellers from './pages/admin/Sellers'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminNavbar from './components/admin/Navbar'
import AdminSidebar from './components/admin/Sidebar'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Admin Layout Component
const AdminLayout = () => {
  const { token, setToken } = useContext(ShopContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protected Route Logic for Admin
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminNavbar token={token} setToken={setToken} toggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:pl-64 pt-14 min-h-screen transition-all duration-300">
        <Outlet />
      </div>
    </div>
  )
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className=''>
      <ToastContainer />

      {/* Show User Navbar only on non-admin routes */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* User Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/profile' element={<Profile />} />

        {/* Admin Routes */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route path='dashboard' element={<AdminPageWrapper component={Dashboard} />} />
          <Route path='add-product' element={<AdminPageWrapper component={Add} />} />
          <Route path='products' element={<AdminPageWrapper component={List} />} />
          <Route path='orders' element={<AdminPageWrapper component={Orders} />} />
          <Route path='customers' element={<AdminPageWrapper component={Customers} />} />
          <Route path='sellers' element={<AdminPageWrapper component={Sellers} />} />
          <Route path='settings' element={<AdminPageWrapper component={Settings} />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Show User Footer only on non-admin routes */}
      {!isAdminRoute && <Footer />}
    </div>
  )
}

// Helper to pass token to Admin Pages if they still rely on props
// We can eventually refactor admin pages to use Context directly
const AdminPageWrapper = ({ component: Component }) => {
  const { token } = useContext(ShopContext);
  return <Component token={token} />;
}

export default App
