import { FiLogOut, FiMenu } from "react-icons/fi"

const Navbar = ({ setToken, toggleSidebar }) => {
  return (
    <div className="h-14 fixed top-0 left-0 right-0 bg-white  border-b border-gray-300 z-40">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div>
              <p className="font-bold text-transparent bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-lg">
                Novamart
              </p>
            </div>

          </div>
        </div>

        {/* Center Section - Page Title (Visible only on desktop) */}
        <div className="sm:hidden flex-1 text-center hidden lg:block">
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
        </div>

        {/* Right Section - Only Logout and Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logout Button - Visible on all screens */}
          <button
            onClick={() => setToken('')}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            onClick={toggleSidebar}
          >
            <FiMenu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar