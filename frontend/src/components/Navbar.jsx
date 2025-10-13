import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { MdOutlineShoppingCart } from "react-icons/md";
import { 
  FaRegUser, 
  FaRegHeart, 
  FaSearch, 
  FaTimes, 
  FaFilter,
  FaUser,
  FaBox,
  FaHeart,
  FaMapMarkerAlt,
  FaCog
} from "react-icons/fa";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [searchBar, setSearchBar] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  const { 
    search, 
    setSearch, 
    getCartCount, 
    navigate, 
    token,
    user,
    // Filter states and functions from context
    category,
    subCategory,
    sortType,
    priceRange,
    maxPrice,
    toggleCategory,
    toggleSubCategory,
    handleSortChange,
    handlePriceChange,
    clearAllFilters,
    getActiveFilterCount
  } = useContext(ShopContext);
  
  const location = useLocation();
  const [showSearchIcon, setShowSearchIcon] = useState(false);

  // Show search only on collection 
  useEffect(() => {
    if (location.pathname.startsWith("/collection")) {
      setShowSearchIcon(true);
    } else {
      setShowSearchIcon(false);
      setSearchBar(false);
    }
  }, [location]);

  // Get display text for price range
  const getPriceDisplayText = () => {
    if (priceRange[0] === 0 && priceRange[1] === maxPrice) {
      return 'All Prices';
    }
    return `₹${priceRange[0].toLocaleString()} - ₹${priceRange[1].toLocaleString()}`;
  };

  return (
    <div className="flex flex-col fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Main Navbar */}
      <div className="flex items-center px-4 sm:px-6 md:px-8 lg:px-10 justify-between py-3 font-medium">
        {/* Logo */}
        <Link to={"/"}>
          <p className="text-lg sm:text-xl font-bold text-gray-900">NovaMart</p>
        </Link>

        {/* Middle Nav Links (Desktop only) */}
        <ul className="hidden md:flex gap-6 lg:gap-8 text-sm text-gray-700">
          <NavLink to={"/"} className={({ isActive }) => `hover:text-black transition-colors ${isActive ? 'text-black font-semibold' : ''}`}>
            HOME
          </NavLink>
          <NavLink to={"/collection"} className={({ isActive }) => `hover:text-black transition-colors ${isActive ? 'text-black font-semibold' : ''}`}>
            COLLECTION
          </NavLink>
          <NavLink to={"/about"} className={({ isActive }) => `hover:text-black transition-colors ${isActive ? 'text-black font-semibold' : ''}`}>
            ABOUT
          </NavLink>
          <NavLink to={"/contact"} className={({ isActive }) => `hover:text-black transition-colors ${isActive ? 'text-black font-semibold' : ''}`}>
            CONTACT
          </NavLink>
        </ul>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
          {/* Search Icon */}
          {showSearchIcon && (
            <button onClick={() => setSearchBar(!searchBar)} className="text-gray-600 hover:text-black transition-colors">
              <FaSearch size={18}  className="cursor-pointer"/>
            </button>
          )}

          {/* Profile with Profile Picture */}
          <button 
            onClick={() => token ? navigate("/profile") : navigate("/login")} 
            className="text-gray-600 cursor-pointer hover:text-black transition-colors"
          >
            {token && user?.profilePic ? (
              <img 
                src={user.profilePic} 
                alt="Profile" 
                className="w-7 h-7 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <FaRegUser size={18} />
            )}
          </button>

          {/* Cart */}
          {token && (
            <Link to="/cart" className="relative text-gray-600 hover:text-black transition-colors">
              <MdOutlineShoppingCart size={20} />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                  {getCartCount()}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setVisible(true)} className="md:hidden text-gray-600 hover:text-black transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchBar && showSearchIcon && (
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center border  border-gray-300 px-4 py-2 rounded-lg w-full max-w-2xl mx-auto">
            <FaSearch className="text-gray-400 mr-3" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="flex-1 outline-none bg-transparent text-sm md:text-base"
            />
            <button onClick={() => setSearchBar(false)} className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
              <FaTimes size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile SideMenu */}
      <div className={`fixed top-0 right-0 bottom-0 bg-white shadow-xl transition-all duration-300 z-50 ${visible ? "w-80 max-w-full" : "w-0"} overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <p className="text-lg font-semibold">Menu</p>
            <button onClick={() => setVisible(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FaTimes size={18} />
            </button>
          </div>

          {/* User Info in Mobile Menu */}
          {token && user && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {user.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <FaRegUser className="text-gray-600" size={16} />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto">
            {[
              { to: "/", label: "HOME" },
              { to: "/collection", label: "COLLECTION" },
              { to: "/about", label: "ABOUT" },
              { to: "/contact", label: "CONTACT" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `block py-4 px-4 border-b border-gray-100 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors ${
                    isActive ? "bg-gray-50 text-black font-semibold" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* Profile Section in Mobile Menu */}
            {token && (
              <div className="border-t border-gray-200">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">My Account</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => { 
                        setVisible(false); 
                        navigate("/profile", { state: { activeSection: "personal" } }); 
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FaUser size={16} />
                      <span>Personal Info</span>
                    </button>
                    <button
                      onClick={() => { 
                        setVisible(false); 
                        navigate("/profile", { state: { activeSection: "orders" } }); 
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FaBox size={16} />
                      <span>Orders</span>
                    </button>
                    <button
                      onClick={() => { 
                        setVisible(false); 
                        navigate("/profile", { state: { activeSection: "wishlist" } }); 
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FaHeart size={16} />
                      <span>Wishlist</span>
                    </button>
                    <button
                      onClick={() => { 
                        setVisible(false); 
                        navigate("/profile", { state: { activeSection: "addresses" } }); 
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FaMapMarkerAlt size={16} />
                      <span>Addresses</span>
                    </button>
                    <button
                      onClick={() => { 
                        setVisible(false); 
                        navigate("/profile", { state: { activeSection: "settings" } }); 
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FaCog size={16} />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters Section - Only show on collection page */}
            {location.pathname.startsWith("/collection") && (
              <div className="border-t border-gray-200">
                <div className="p-4">
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center justify-between w-full text-left py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FaFilter size={16} />
                      <span className="font-medium">FILTERS</span>
                      {getActiveFilterCount() > 0 && (
                        <span className="bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </div>
                    <img
                      className={`h-3 transition-transform duration-300 ${filterOpen ? 'rotate-180' : ''}`}
                      src={assets.dropdown_icon}
                      alt="dropdown"
                    />
                  </button>
                </div>

                {/* Filter Content */}
                {filterOpen && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Clear Filters Button */}
                    <button
                      onClick={clearAllFilters}
                      disabled={getActiveFilterCount() === 0}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        getActiveFilterCount() === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-900'
                      }`}
                    >
                      Clear All Filters
                    </button>

                    {/* Sort Options */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-3">SORT BY</h4>
                      <div className="space-y-2">
                        {[
                          { value: 'relevant', label: 'Relevant' },
                          { value: 'low-high', label: 'Price: Low to High' },
                          { value: 'high-low', label: 'Price: High to Low' }
                        ].map(option => (
                          <label key={option.value} className='flex items-center gap-3 cursor-pointer group'>
                            <input
                              type="radio"
                              name="sort"
                              value={option.value}
                              onChange={(e) => handleSortChange(e.target.value)}
                              checked={sortType === option.value}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className='text-sm group-hover:text-gray-900 transition-colors'>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-3">PRICE RANGE</h4>
                      <div className="space-y-3">
                        <div className='flex justify-between text-xs font-medium'>
                          <span>₹{priceRange[0].toLocaleString()}</span>
                          <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                        
                        {/* Quick Price Buttons */}
                        <div className='flex flex-wrap gap-2'>
                          {[
                            [0, 500],
                            [500, 1000],
                            [1000, 2000],
                            [2000, maxPrice]
                          ].map(([min, max]) => (
                            <button
                              key={`${min}-${max}`}
                              onClick={() => handlePriceChange(min, max)}
                              className={`px-2 py-1 text-xs border rounded transition-colors flex-1 min-w-[60px] ${
                                priceRange[0] === min && priceRange[1] === max
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              ₹{min}-{max}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-3">CATEGORIES</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {['Fashion', 'Electronics', 'Home & Furniture', 'Sports', 'Books', 'Laptops', 'Accessories', 'Others'].map(cat => (
                          <label key={cat} className='flex items-center gap-3 cursor-pointer group'>
                            <input
                              type="checkbox"
                              value={cat}
                              onChange={(e) => toggleCategory(e.target.value)}
                              checked={category.includes(cat)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className='text-sm group-hover:text-gray-900 transition-colors'>{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Apply Filters Button */}
                    <button
                      onClick={() => {
                        setVisible(false);
                        // Filters are automatically applied through shared context state
                      }}
                      className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Apply Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {token ? (
              <div className="space-y-3">
                <button 
                  onClick={() => { setVisible(false); navigate("/profile"); }} 
                  className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center font-medium"
                >
                  My Account
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem("token");
                    setVisible(false);
                    window.location.href = "/login";
                  }}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => { setVisible(false); navigate("/login"); }} className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center font-medium">
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setVisible(false)} />
      )}
    </div>
  );
};

export default Navbar;