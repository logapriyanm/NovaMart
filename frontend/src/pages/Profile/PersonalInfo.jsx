import { useContext, useState, useRef } from "react";
import { ShopContext } from "../../context/ShopContext";
import { FaCamera, FaUser, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

const PersonalInfo = () => {
  const { user, updateUserProfile, token } = useContext(ShopContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [profilePic, setProfilePic] = useState(user?.profilePic || "");
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePicClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('profilePicture', file);
      
      // Update profile with new picture
      const result = await updateUserProfile(uploadFormData);
      
      if (result.success) {
        setProfilePic(result.user.profilePic);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Error uploading profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setProfilePic(user?.profilePic || "");
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Personal Information</h1>
        <p className="text-gray-600">Manage your personal information and profile picture</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Picture Section - Left Side */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 self-start lg:self-center">Profile Picture</h2>
            <div className="relative mb-4">
              <div 
                className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 ${
                  isEditing ? 'border-blue-500 cursor-pointer' : 'border-gray-300'
                } ${loading ? 'opacity-50' : ''}`}
                onClick={handleProfilePicClick}
              >
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-gray-400 text-4xl md:text-5xl" />
                  </div>
                )}
              </div>
              
              {isEditing && (
                <>
                  <button
                    onClick={handleProfilePicClick}
                    disabled={loading}
                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <FaCamera size={16} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {isEditing 
                  ? "Click the camera icon to upload a new profile picture"
                  : ""
                }
              </p>
              {loading && (
                <p className="text-sm text-blue-600">Uploading...</p>
              )}
            </div>
          </div>

          {/* Personal Information Form - Right Side */}
          <div className="lg:w-2/3">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Details</h2>
            
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400">
                      <FaUser size={16} />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <p className="px-4 py-3 pr-12 text-gray-900 bg-gray-50 rounded-lg">
                      {user?.name || "Not provided"}
                    </p>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400">
                      <FaUser size={16} />
                    </div>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400">
                      <FaEnvelope size={16} />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <p className="px-4 py-3 pr-12 text-gray-900 bg-gray-50 rounded-lg truncate">
                      {user?.email}
                    </p>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400">
                      <FaEnvelope size={16} />
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400">
                      <FaPhoneAlt size={16} />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <p className="px-4 py-3 pr-12 text-gray-900 bg-gray-50 rounded-lg">
                      {user?.phone || "Not provided"}
                    </p>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400">
                      <FaPhoneAlt size={16} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-blue-500 text-white cursor-pointer rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;