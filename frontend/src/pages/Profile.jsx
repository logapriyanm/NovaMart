import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import avatar from "../assets/avatar-placeholder.png";

const ProfilePage = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ address: {} });
  const [profilePicFile, setProfilePicFile] = useState(null);

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: {
            Authorization:  `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.user);
          setFormData(response.data.user || { address: {} });
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch profile");
      }
    };

    if (token) fetchProfile();
  }, [token, backendUrl]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Handle image change
  const handleImageChange = (e) => {
    setProfilePicFile(e.target.files[0]);
  };

  // ✅ Save updated profile
  const handleSave = async () => {
    try {
      const data = new FormData();
      if (profilePicFile) data.append("profilePic", profilePicFile);

      data.append("name", formData.name || "");
      data.append("email", formData.email || "");

      const addressFields = ["street", "city", "state", "zipcode", "country", "phone"];
      addressFields.forEach((key) => {
        data.append(`address[${key}]`, formData.address?.[key] || "");
      });

      const res = await axios.put(`${backendUrl}/api/user/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Correct header
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
        setEditMode(false);
        setProfilePicFile(null);
        localStorage.setItem("token", response.data.token); // not response.data
        toast.success("Profile updated!");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Update profile error:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        toast.error("Not Authorized, Login Again");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error(err.response?.data?.message || "Failed to update profile");
      }
    }
  };

  if (!user) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col py-20 items-center px-4">
      {/* Profile Picture */}
      <div className="relative">
        <img
          src={profilePicFile ? URL.createObjectURL(profilePicFile) : user.profilePic || avatar}
          alt="profile"
          className="w-28 h-28 rounded-full object-cover border"
        />
        {editMode && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 text-sm"
          />
        )}
      </div>

      {editMode ? (
        <div className="mt-6 w-full max-w-md flex flex-col gap-3">
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Full name"
            className="border p-2 rounded"
          />

          <input
            name="email"
            value={formData.email || ""}
            readOnly
            className="border p-2 rounded bg-gray-100 cursor-not-allowed"
          />

          <input
            name="address.street"
            value={formData.address?.street || ""}
            onChange={handleChange}
            placeholder="Street"
            className="border p-2 rounded"
          />

          <div className="flex gap-3">
            <input
              name="address.city"
              value={formData.address?.city || ""}
              onChange={handleChange}
              placeholder="City"
              className="border p-2 rounded w-1/2"
            />
            <input
              name="address.state"
              value={formData.address?.state || ""}
              onChange={handleChange}
              placeholder="State"
              className="border p-2 rounded w-1/2"
            />
          </div>

          <input
            name="address.zipcode"
            value={formData.address?.zipcode || ""}
            onChange={handleChange}
            placeholder="Zipcode"
            className="border p-2 rounded"
          />

          <input
            name="address.country"
            value={formData.address?.country || ""}
            onChange={handleChange}
            placeholder="Country"
            className="border p-2 rounded"
          />

          <input
            name="address.phone"
            value={formData.address?.phone || ""}
            onChange={handleChange}
            placeholder="Phone"
            className="border p-2 rounded"
          />

          <button
            onClick={handleSave}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          {user.address ? (
            <div className="text-gray-500 mt-4 text-center">
              <p>{user.address.street}</p>
              <p>
                {user.address.city}, {user.address.state} {user.address.zipcode}
              </p>
              <p>{user.address.country}</p>
              <p>{user.address.phone}</p>
            </div>
          ) : (
            <p>No address provided</p>
          )}
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
