import './index.css'
import { Routes, Route } from 'react-router-dom'
import Home from "./pages/Home"
import Collection from "./pages/Collection"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Product from "./pages/Product"
import Cart from "./pages/Cart"
import Login from "./pages/Login"
import PlaceOrder from "./pages/PlaceOrder"

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from './pages/Verify'
import Profile from './pages/Profile/Profile'
import NotFound from './pages/NotFound';


function App() {


  return (
    <div className='  '>
      <ToastContainer />
      <Navbar />

      <Routes>
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
        <Route path="*" element={<NotFound />} />

      </Routes>
      <Footer />
    </div>
  )
}

export default App
