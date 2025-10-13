// context/ShopContext.jsx
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "₹";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState({});
  const [likedProducts, setLikedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null); // Add user state
  const navigate = useNavigate();

  // Filter states - shared across components
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [priceRange, setPriceRange] = useState([0, 500000]);

  // Calculate max price from products for dynamic range
  const maxPrice = Math.max(...products.map(item => item.price), 1000);

  // Helper function to check if category should use sizes
  const shouldUseSizes = (category) => {
    const fashionCategories = ['Fashion', 'Clothing', 'Apparel'];
    return fashionCategories.includes(category);
  };

  // Filter functions
  const toggleCategory = (cat) => {
    if (category.includes(cat)) {
      setCategory(prev => prev.filter(item => item !== cat));
    } else {
      setCategory(prev => [...prev, cat]);
    }
  };

  const toggleSubCategory = (subCat) => {
    if (subCategory.includes(subCat)) {
      setSubCategory(prev => prev.filter(item => item !== subCat));
    } else {
      setSubCategory(prev => [...prev, subCat]);
    }
  };

  const handleSortChange = (sort) => {
    setSortType(sort);
  };

  const handlePriceChange = (min, max) => {
    setPriceRange([min, max]);
  };

  const clearAllFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setPriceRange([0, maxPrice]);
    setSortType('relevant');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (category.length > 0) count++;
    if (subCategory.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (sortType !== 'relevant') count++;
    return count;
  };

  // ---------------- USER PROFILE FUNCTIONS ----------------
  const getUserProfile = async (token) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  };

  const updateUserProfile = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      // Check if formData is FormData (file upload) or regular object
      const isFormData = formData instanceof FormData;
      
      const response = await fetch(`${backendUrl}/api/user/update-profile`, {
        method: 'PUT',
        headers: isFormData ? {
          'Authorization': `Bearer ${token}`,
        } : {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: isFormData ? formData : JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        toast.success('Profile updated successfully!');
        return { success: true, user: data.user };
      } else {
        toast.error(data.message || 'Failed to update profile');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error while updating profile');
      return { success: false, message: 'Network error' };
    }
  };

  // ---------------- WISHLIST ----------------
  const toggleLike = async (productId) => {
    if (!token) {
      toast.info("Please login to manage wishlist");
      navigate("/login");
      return;
    }

    try {
      console.log("Toggling wishlist for product:", productId);

      const response = await axios.post(
        `${backendUrl}/api/user/wishlist/toggle`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Wishlist response:", response.data);

      if (response.data.success) {
        setLikedProducts(response.data.likedProducts);
        if (response.data.likedProducts.includes(productId)) {
          toast.success("Added to Wishlist");
        } else {
          toast.info("Removed from Wishlist");
        }
      } else {
        toast.error(response.data.message || "Wishlist update failed");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    }
  };

  const isLiked = (productId) => likedProducts.includes(productId);

  // ---------------- CART ----------------
  const addToCart = async (itemId, size, quantity = 1) => {
    if (!token) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      // Get product data for local stock check
      const product = products.find(p => p._id === itemId);
      if (!product) {
        toast.error("Product not found");
        return;
      }

      // Determine the actual size to use based on product category
      let actualSize = size;
      if (!shouldUseSizes(product.category)) {
        // For non-fashion products, use "One Size"
        actualSize = "One Size";
      }

      // Validate size for fashion products
      if (shouldUseSizes(product.category) && (!actualSize || actualSize === "")) {
        toast.error("Please select product size");
        return;
      }

      // Local stock check
      const sizeInfo = product.sizes?.find(s => s.size === actualSize);
      const availableStock = sizeInfo ? sizeInfo.quantity : 0;
      
      if (availableStock === 0) {
        toast.error("This item is out of stock");
        return;
      }

      // Check if adding this quantity would exceed stock
      const currentInCart = cartItems[itemId]?.[actualSize] || 0;
      const totalAfterAdd = currentInCart + quantity;

      if (totalAfterAdd > availableStock) {
        toast.error(`Only ${availableStock} items available in stock. You already have ${currentInCart} in cart.`);
        return;
      }

      // If all checks pass, proceed with adding to cart
      const cartResponse = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size: actualSize, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (cartResponse.data.success) {
        // Update local state
        const cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
          cartData[itemId][actualSize] = (cartData[itemId][actualSize] || 0) + quantity;
        } else {
          cartData[itemId] = { [actualSize]: quantity };
        }
        setCartItems(cartData);
        toast.success(`Added ${quantity} item(s) to cart`);
      } else {
        toast.error(cartResponse.data.message || "Failed to add to cart");
      }

    } catch (error) {
      console.error("Add to cart error:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    try {
      const cartData = structuredClone(cartItems);

      if (quantity === 0) {
        // Remove item
        if (cartData[itemId] && cartData[itemId][size]) {
          delete cartData[itemId][size];
          if (Object.keys(cartData[itemId]).length === 0) {
            delete cartData[itemId];
          }
        }
      } else {
        // Update quantity
        cartData[itemId][size] = quantity;
      }

      setCartItems(cartData);

      if (token) {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      console.error("Update cart error:", error);
      toast.error(error.response?.data?.message || "Failed to update cart");
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/cart/get`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  };

  const getUserWishlist = async (token) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/user/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        setLikedProducts(response.data.likedProducts || []);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      getUserCart(savedToken);
      getUserWishlist(savedToken);
      getUserProfile(savedToken); // Fetch user profile
    }
  }, []);

  useEffect(() => {
    if (token) {
      getUserCart(token);
      getUserWishlist(token);
      getUserProfile(token); // Fetch user profile when token changes
    }
  }, [token]);

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  const value = {
    // Products and basic states
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    
    // User profile
    user,
    setUser,
    updateUserProfile,
    
    // Cart functionality
    cartItems,
    addToCart,
    setCartItems,
    getCartCount: () => {
      let totalCount = 0;
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          totalCount += cartItems[productId][size] || 0;
        }
      }
      return totalCount;
    },
    updateQuantity,
    getCartAmount: () => {
      let totalAmount = 0;
      for (const productId in cartItems) {
        const product = products.find((p) => p._id === productId);
        if (!product) continue;
        for (const size in cartItems[productId]) {
          totalAmount += (cartItems[productId][size] || 0) * product.price;
        }
      }
      return totalAmount;
    },
    
    // Navigation and auth
    navigate,
    
    // Wishlist functionality
    likedProducts,
    toggleLike,
    isLiked,
    
    // Helper functions
    shouldUseSizes,
    
    // Backend and token
    backendUrl,
    token,
    setToken: (newToken) => {
      setToken(newToken);
      if (newToken) {
        localStorage.setItem("token", newToken);
        getUserCart(newToken);
        getUserWishlist(newToken);
        getUserProfile(newToken);
      } else {
        localStorage.removeItem("token");
        setCartItems({});
        setLikedProducts([]);
        setUser(null);
      }
    },
    
    // Filter states and functions
    category,
    setCategory,
    subCategory,
    setSubCategory,
    sortType,
    setSortType,
    priceRange,
    setPriceRange,
    maxPrice,
    toggleCategory,
    toggleSubCategory,
    handleSortChange,
    handlePriceChange,
    clearAllFilters,
    getActiveFilterCount,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;