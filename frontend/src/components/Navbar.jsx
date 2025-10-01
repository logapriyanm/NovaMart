import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

// Icons 
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegUser, FaRegHeart } from "react-icons/fa";

const Navbar = () => {
  const [visible, setVisible] = useState(false);   // side menu
  const [searchBar, setSearchBar] = useState(false); // 🔥 toggled search (desktop + mobile)
  const { search, setSearch, setShowSearch, getCartCount, likedProducts, navigate, token, setToken, setCartItems } = useContext(ShopContext);
  const logout =()=>{
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    
  }

  const location = useLocation();

  const [showSearchIcon, setShowSearchIcon] = useState(false);

  // ✅ Show search only on collection ("/collection")
  useEffect(() => {
    if (location.pathname.startsWith("/collection")) {
      setShowSearchIcon(true);
    } else {
      setShowSearchIcon(false);
      setSearchBar(false); // hide search bar when leaving collection
    }
  }, [location]);

  return (
    <div className="flex flex-col fixed top-0 left-0 right-0 z-50 bg-white shadow">
      {/* Top Navbar */}
      <div className="flex items-center px-4 sm:px-10 justify-between py-2 font-medium">
        {/* Logo */}
        <Link to={"/"}>
          <p className="text-lg font-bold text-secondary">NovaMart</p>
        </Link>

        {/* Middle Nav Links (Desktop only) */}
        <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
          <NavLink to={"/"}>HOME</NavLink>
          <NavLink to={"/collection"}>COLLECTION</NavLink>
          <NavLink to={"/about"}>ABOUT</NavLink>
          <NavLink to={"/contact"}>CONTACT</NavLink>
        </ul>

        {/* Right Icons */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* 🔍 Search Icon (only on home/collection) */}
          {showSearchIcon && (
            <img
              onClick={() => setSearchBar(!searchBar)}
              src={assets.search_icon}
              className="w-5 cursor-pointer"
              alt="search"
            />
          )}

          {/* Profile */}
          <div className="group relative">
            
              <FaRegUser onClick={()=> token ? null : navigate('/login') } size={20} />

                {/* Dropdown */}
              {token && 
              <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
                <div className="flex flex-col gap-2 py-3 w-36 px-5 bg-slate-100 text-gray-500 rounded">
                  <p onClick={()=>navigate('/profile')} className="cursor-pointer hover:text-black">My Profile</p>
                  <p onClick={()=>navigate('/orders')} className="cursor-pointer hover:text-black">Orders</p>
                  <p onClick={logout} className="cursor-pointer hover:text-black">Logout</p>
                </div>
              </div>
              }
           
          </div>

          <Link to={"/likedproducts"} className="relative cursor-pointer">
            <FaRegHeart size={20} />
            {likedProducts.length > 0 && (
              <p className="absolute -top-2 -right-2 w-4 h-4 text-center bg-red-500 text-white text-[8px] rounded-full">
                {likedProducts.length}
              </p>
            )}
          </Link>


          {/* Cart */}
          <Link to="/cart" className="relative">
            <MdOutlineShoppingCart size={20} className="cursor-pointer" />
            <p className="absolute -top-2 -right-2 w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
              {getCartCount()}
            </p>
          </Link>

          {/* Mobile Menu Icon */}
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-5 cursor-pointer sm:hidden"
            alt="menu"
          />
        </div>
      </div>

      {/* 🔥 Search Bar (desktop + mobile, controlled input) */}
      {searchBar && showSearchIcon && (
        <div className="w-full px-4 py-2 border-t border-b bg-white md:px-10 flex justify-center">
          <div className="flex items-center border border-gray-400 px-4 py-1 rounded-full w-full max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="flex-1 outline-none bg-transparent text-sm"
            />



            {/* Close Search Bar */}
            <button
              onClick={() => setSearchBar(false)}
              className="ml-2 text-gray-500 text-xs hover:text-black"
            >
              ✖
            </button>
          </div>
        </div>
      )}



      {/* Mobile SideMenu */}
      <div
        className={`fixed top-0 right-0 bottom-0 bg-white shadow-lg transition-all duration-300 ${visible ? "w-64" : "w-0"
          } overflow-hidden`}
      >
        <div className="flex flex-col text-gray-700 h-full">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-4 cursor-pointer border-b"
          >
            <img src={assets.dropdown_icon} className="h-4 rotate-180" alt="back" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className="py-3 px-6 border-b" to="/">
            HOME
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-3 px-6 border-b" to="/collection">
            COLLECTION
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-3 px-6 border-b" to="/about">
            ABOUT
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-3 px-6 border-b" to="/contact">
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
