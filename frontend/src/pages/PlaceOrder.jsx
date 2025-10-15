import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    district: "", 
    state: "", 
    pincode: "",
    phone: "",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  // Fetch user profile and addresses
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.data.success) {
          const user = res.data.user;
          
          // Set saved addresses
          setSavedAddresses(user.addresses || []);
          
          
          if (user.defaultAddress) {
            setFormData({
              firstName: user.defaultAddress.firstName || "",
              lastName: user.defaultAddress.lastName || "",
              email: user.email || "",
              street: user.defaultAddress.street || "",
              city: user.defaultAddress.city || "",
              district: user.defaultAddress.district || "",
              state: user.defaultAddress.state || "", 
              pincode: user.defaultAddress.pincode || "",
              phone: user.defaultAddress.phone || "",
            });
            setSelectedAddress(user.defaultAddress._id);
          } else if (user.addresses && user.addresses.length > 0) {
            // Use first address if no default
            const firstAddress = user.addresses[0];
            setFormData({
              firstName: firstAddress.firstName || "",
              lastName: firstAddress.lastName || "",
              email: user.email || "",
              street: firstAddress.street || "",
              city: firstAddress.city || "",
              district: firstAddress.district || "", 
              state: firstAddress.state || "", 
              pincode: firstAddress.pincode || "",
              phone: firstAddress.phone || "",
            });
            setSelectedAddress(firstAddress._id);
          } else {
            
            setFormData(prev => ({ ...prev, email: user.email || "" }));
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, [token, backendUrl]);

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    const address = savedAddresses.find(addr => addr._id === addressId);
    if (address) {
      setFormData({
        firstName: address.firstName,
        lastName: address.lastName,
        email: formData.email, 
        street: address.street,
        city: address.city,
        district: address.district, 
        state: address.state, 
        pincode: address.pincode,
        phone: address.phone,
      });
      setSelectedAddress(addressId);
    }
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(data => ({ ...data, [name]: value }));
    
    if (selectedAddress) {
      setSelectedAddress("");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("You must be logged in to place an order.");
      return;
    }

    if (!cartItems || Object.keys(cartItems).length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      // Prepare items array for backend
      let orderItems = [];
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          const quantity = cartItems[productId][size];
          if (quantity > 0) {
            const product = products.find((p) => p._id === productId);
            if (product) {
              orderItems.push({
                _id: product._id,
                name: product.name,
                size,
                quantity,
                price: product.price,
              });
            }
          }
        }
      }

      const orderData = {
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        address: formData,
      };

      switch (method) {
        case "cod": {
          const res = await axios.post(backendUrl + '/api/order/place', orderData, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data.success) {
            // Save address to user profile if not already saved
            if (!selectedAddress && savedAddresses.length === 0) {
              try {
                await axios.post(
                  `${backendUrl}/api/user/addresses`,
                  { ...formData, isDefault: true },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } catch (addrError) {
                console.error("Failed to save address:", addrError);
              }
            }

            toast.success("Order placed successfully!");
            setCartItems({});
            navigate("/collection");
          } else {
            toast.error(res.data.message || "Failed to place order");
          }
          break;
        }

        case "stripe": {
          const res = await axios.post(`${backendUrl}/api/order/stripe`, orderData, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data.success) {
            // Save address to user profile if not already saved
            if (!selectedAddress && savedAddresses.length === 0) {
              try {
                await axios.post(
                  `${backendUrl}/api/user/addresses`,
                  { ...formData, isDefault: true },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } catch (addrError) {
                console.error("Failed to save address:", addrError);
              }
            }

            const { session_url } = res.data;
            window.location.href = session_url;
           
          } else {
            toast.error(res.data.message || "Failed to initiate Stripe payment");
          }
          break;
        }

        default:
          toast.error("Select a payment method.");
      }
    } catch (err) {
      console.error("Place order error:", err);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex md:p-30 p-10 flex-col sm:flex-row justify-between gap-4 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* Left Side - Delivery Info */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="Delivery" text2="Information" />
        </div>

        {/* Saved Addresses Dropdown */}
        {savedAddresses.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Saved Address
            </label>
            <select
              value={selectedAddress}
              onChange={(e) => handleAddressSelect(e.target.value)}
              className="w-full border border-gray-300 rounded py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an address</option>
              {savedAddresses.map((address) => (
                <option key={address._id} value={address._id}>
                  {address.firstName} {address.lastName} - {address.street}, {address.city}
                  {address.isDefault && " (Default)"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-4">
          <input
            name="firstName"
            value={formData.firstName}
            onChange={onChangeHandler}
            placeholder="First name"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            required
          />
          <input
            name="lastName"
            value={formData.lastName}
            onChange={onChangeHandler}
            placeholder="Last name"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            required
          />
        </div>
        <input
          name="email"
          value={formData.email}
          onChange={onChangeHandler}
          placeholder="Email"
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          required
        />
        <input
          name="street"
          value={formData.street}
          onChange={onChangeHandler}
          placeholder="Street"
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          required
        />
        <div className="flex gap-4">
          <input
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            placeholder="City"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            required
          />
          <input
            name="district"
            value={formData.district}
            onChange={onChangeHandler}
            placeholder="District"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            required
          />
        </div>
        <div className="flex gap-4">
          <input
            name="state"
            value={formData.state}
            onChange={onChangeHandler}
            placeholder="State"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            required
          />
          <input
            name="pincode"
            value={formData.pincode}
            onChange={onChangeHandler}
            placeholder="Pincode"
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            required
          />
        </div>
        <input
          name="phone"
          value={formData.phone}
          onChange={onChangeHandler}
          placeholder="Phone"
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          required
        />
      </div>

      {/* Right Side - Cart & Payment */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12 ml-5">
          <Title text1="Payment" text2="Method" />
          <div className="flex gap-3 flex-col lg:flex-row mt-4">
            {/* Stripe */}
            <div
              onClick={() => setMethod("stripe")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "stripe" ? "border-green-500" : ""
              }`}
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "stripe" ? "bg-green-400" : ""}`}></p>
              <img src={assets.stripe_logo} alt="Stripe" className="h-6" />
            </div>

            {/* COD */}
            <div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "cod" ? "border-green-500" : ""
              }`}
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "cod" ? "bg-green-400" : ""}`}></p>
              <p className="text-gray-500 text-sm font-medium mx-4">Cash On Delivery</p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button type="submit" className="bg-black cursor-pointer text-white px-16 py-3 text-sm rounded hover:bg-gray-800 transition-colors">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;