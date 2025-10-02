// pages/ProfilePage.jsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";


const ProfilePage = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { token },
        });
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch profile");
      }
    };

    if (token) fetchProfile();
  }, [token]);

  if (!user) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col items-center py-10 px-4">
      {/* Profile Picture */}
      <img
        src={user.profilePic || "https://via.placeholder.com/100"}
        alt="profile"
        className="w-28 h-28 rounded-full object-cover border"
      />

      {/* User Info */}
      <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
      <p className="text-gray-500 mt-2">
        {user.address || "No address provided"}
      </p>
    </div>
  );
};


export default ProfilePage