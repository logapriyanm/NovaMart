import React, { useState } from 'react'
import { NavLink, useLocation } from "react-router-dom"
import { 
  FiHome, 
  FiPackage, 
  FiPlus, 
  FiList, 
  FiShoppingCart, 
  FiUsers,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiLogOut
} from 'react-icons/fi'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [openDropdown, setOpenDropdown] = useState(null)
  const location = useLocation()

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu)
  }

  const menuItems = [
    {
      type: 'single',
      path: '/dashboard',
      icon: <FiHome className="w-5 h-5" />,
      label: 'Dashboard'
    },
    {
      type: 'dropdown',
      key: 'products',
      icon: <FiPackage className="w-5 h-5" />,
      label: 'Products',
      items: [
        { path: '/products', icon: <FiList className="w-4 h-4" />, label: 'All Products' },
        { path: '/add-product', icon: <FiPlus className="w-4 h-4" />, label: 'Add Product' },
      ]
    },
    {
      type: 'single',
      path: '/orders',
      icon: <FiShoppingCart className="w-5 h-5" />,
      label: 'Orders',
    },
    {
      type: 'single',
      path: '/customers',
      icon: <FiUsers className="w-5 h-5" />,
      label: 'Customers'
    },
    {
      type: 'single',
      path: '/settings',
      icon: <FiSettings className="w-5 h-5" />,
      label: 'Settings'
    }
  ]

  // Auto-open dropdown if current path matches any sub-item
  React.useEffect(() => {
    menuItems.forEach(item => {
      if (item.type === 'dropdown') {
        const isActive = item.items.some(subItem => 
          location.pathname === subItem.path
        )
        if (isActive) {
          setOpenDropdown(item.key)
        }
      }
    })
  }, [location.pathname])

  return (
    <>
      {/* Desktop Sidebar - Left side */}
      <div className='w-64 h-screen fixed left-0 top-0 pt-20 border-r-2 border-gray-200 bg-white z-30 overflow-y-auto hidden lg:block'>
        {/* Logo Section */}
      
        {/* Navigation Menu */}
        <div className='flex flex-col gap-1 pt-4 px-4 text-[15px]'>
          {menuItems.map((item, index) => (
            <div key={item.key || item.path}>
              {item.type === 'single' ? (
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {item.icon}
                  <span className='flex-1'>{item.label}</span>
                </NavLink>
              ) : (
                <div>
                  <button
                    onClick={() => toggleDropdown(item.key)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-200 group ${
                      openDropdown === item.key || item.items.some(subItem => location.pathname === subItem.path)
                        ? 'bg-blue-50 text-blue-600 border border-blue-200 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {openDropdown === item.key ? (
                      <FiChevronDown className="w-4 h-4 transition-transform" />
                    ) : (
                      <FiChevronRight className="w-4 h-4 transition-transform" />
                    )}
                  </button>
                  
                  {openDropdown === item.key && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 pl-3 py-1">
                      {item.items.map((subItem, subIndex) => (
                        <NavLink
                          key={subIndex}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                          }
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar - Right side */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />
        
        {/* Sidebar Panel */}
        <div className={`absolute top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Mobile Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FiHome className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Novamart</p>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Menu */}
          <div className='flex flex-col gap-2 pt-6 px-4 text-[16px] h-[calc(100vh-140px)] overflow-y-auto'>
            {menuItems.map((item, index) => (
              <div key={item.key || item.path}>
                {item.type === 'single' ? (
                  <NavLink 
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                    <span className='flex-1 text-lg'>{item.label}</span>
                  </NavLink>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.key)}
                      className={`flex items-center justify-between w-full px-4 py-4 rounded-xl transition-all duration-200 group ${
                        openDropdown === item.key || item.items.some(subItem => location.pathname === subItem.path)
                          ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                        <span className="text-lg">{item.label}</span>
                      </div>
                      {openDropdown === item.key ? (
                        <FiChevronDown className="w-5 h-5 transition-transform" />
                      ) : (
                        <FiChevronRight className="w-5 h-5 transition-transform" />
                      )}
                    </button>
                    
                    {openDropdown === item.key && (
                      <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-200 pl-4 py-2">
                        {item.items.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-all duration-200 group ${
                                isActive
                                  ? 'bg-blue-50 text-blue-600 font-semibold'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`
                            }
                          >
                            {React.cloneElement(subItem.icon, { className: "w-5 h-5" })}
                            <span>{subItem.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Logout Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <button 
              onClick={() => {
                // Handle logout
                setIsOpen(false)
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-lg font-medium"
            >
              <FiLogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar