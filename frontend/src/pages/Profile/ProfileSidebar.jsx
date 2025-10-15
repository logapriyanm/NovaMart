import { FaUser, FaBox, FaHeart, FaMapMarkerAlt, FaCog, FaSignOutAlt, FaTimes } from "react-icons/fa";

const ProfileSidebar = ({ activeSection, setActiveSection, handleLogout, onMobileItemClick }) => {
  const menu = [
    { name: "Personal Info", icon: <FaUser size={18} />, key: "personal" },
    { name: "Orders", icon: <FaBox size={18} />, key: "orders" },
    { name: "Wishlist", icon: <FaHeart size={18} />, key: "wishlist" },
    { name: "Addresses", icon: <FaMapMarkerAlt size={18} />, key: "addresses" },
    { name: "Settings", icon: <FaCog size={18} />, key: "settings" },
  ];

  const handleItemClick = (key) => {
    setActiveSection(key);
    if (onMobileItemClick) {
      onMobileItemClick(); 
    }
  };

  return (
    <div className="bg-white lg:bg-gray-50 w-full h-full lg:h-auto p-4 lg:p-6 rounded-xl lg:shadow-md">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Profile Menu</h2>
        <button
          onClick={onMobileItemClick}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaTimes size={18} />
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {menu.map((item) => (
          <li key={item.key}>
            <button
              onClick={() => handleItemClick(item.key)}
              className={`w-full flex items-center gap-4 cursor-pointer p-3 lg:p-4 rounded-lg text-left transition-all ${
                activeSection === item.key 
                  ? "bg-black text-white shadow-md" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-black"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </button>
          </li>
        ))}
        
        {/* Logout Button */}
        <li className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              handleLogout();
              if (onMobileItemClick) onMobileItemClick();
            }}
            className="w-full flex cursor-pointer items-center gap-4 p-3 lg:p-4 rounded-lg text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <FaSignOutAlt size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;