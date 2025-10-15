import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";
import PersonalInfo from "./PersonalInfo";
import Orders from "./Orders";
import Wishlist from "./Wishlist";
import AddressBook from "./AddressBook";
import Settings from "./Settings";

const Profile = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("personal");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setShowMobileSidebar(false); 
  };

  const handleMobileItemClick = () => {
    setShowMobileSidebar(false); 
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Mobile Header */}
        {/* <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 mb-4">
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="flex items-center gap-3 w-full text-left"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${showMobileSidebar ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="font-semibold">Profile Menu</span>
          </button>
        </div> */}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className={`lg:w-80 transition-all duration-300 ${
            showMobileSidebar 
              ? 'fixed top-16 left-0 right-0 z-50 bg-white shadow-xl' 
              : 'hidden'
          } lg:block lg:relative lg:top-0 lg:bg-transparent lg:shadow-none`}>
            <ProfileSidebar
              activeSection={activeSection}
              setActiveSection={handleSectionChange} // Use the new handler
              handleLogout={handleLogout}
              onMobileItemClick={handleMobileItemClick}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
              {activeSection === "personal" && <PersonalInfo />}
              {activeSection === "orders" && <Orders />}
              {activeSection === "wishlist" && <Wishlist />}
              {activeSection === "addresses" && <AddressBook />}
              {activeSection === "settings" && <Settings />}
            </div>
          </div>
        </div>

        {/* Mobile Overlay - Only show when sidebar is open */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;