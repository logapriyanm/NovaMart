import { useState, useEffect, useContext } from "react";
import { FaTrash, FaEdit, FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { ShopContext } from "../../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const AddressBook = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    phone: "",
    isDefault: false
  });

  // Fetch addresses from backend
  const fetchAddresses = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/user/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        setAddresses(response.data.addresses || []);
      } else {
        toast.error(response.data.message || "Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Fetch addresses error:", error);
      toast.error(error.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  // Add new address
  const addAddress = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to manage addresses");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/addresses`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success("Address added successfully");
        setShowForm(false);
        resetForm();
        fetchAddresses();
      } else {
        toast.error(response.data.message || "Failed to add address");
      }
    } catch (error) {
      console.error("Add address error:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  // Update address
  const updateAddress = async (e) => {
    e.preventDefault();
    if (!token || !editingAddress) return;

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/addresses/${editingAddress._id}`, // Updated route
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success("Address updated successfully");
        setShowForm(false);
        setEditingAddress(null);
        resetForm();
        fetchAddresses();
      } else {
        toast.error(response.data.message || "Failed to update address");
      }
    } catch (error) {
      console.error("Update address error:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update address");
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backendUrl}/api/user/addresses/${addressId}`, // Updated route
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      } else {
        toast.error(response.data.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Delete address error:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId) => {
    if (!token) return;

    try {
      const response = await axios.patch( // Changed to PATCH
        `${backendUrl}/api/user/addresses/${addressId}/default`, // Updated route
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        toast.success("Default address updated");
        fetchAddresses();
      } else {
        toast.error(response.data.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("Set default address error:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to set default address");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      street: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      phone: "",
      isDefault: false
    });
  };

  // Edit address
  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      district: address.district || "",
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    resetForm();
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Address Book</h2>
        <p className="text-gray-500">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="md:flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold pb-5 md:pb-0">Address Book</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="flex cursor-pointer items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FaPlus />
          Add New Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={editingAddress ? updateAddress : addAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Street Address *"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="City *"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="District *"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="State *"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Pincode *"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black"
                  required
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  className="rounded"
                />
                Set as default address
              </label>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 cursor-pointer bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  {editingAddress ? "Update Address" : "Add Address"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 cursor-pointer border border-gray-300 py-2 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No addresses saved</p>
          <p className="text-gray-400">Add your first address to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`p-4 border rounded-lg shadow-sm ${
                address.isDefault ? 'border-black border-2' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-lg">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.isDefault && (
                      <span className="bg-black text-white text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{address.street}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.district}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-gray-500 mt-1">{address.phone}</p>
                  
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(address._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                    >
                      Set as default
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="text-gray-600 cursor-pointer hover:text-black p-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteAddress(address._id)}
                    className="text-gray-600 cursor-pointer hover:text-red-600 p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBook;