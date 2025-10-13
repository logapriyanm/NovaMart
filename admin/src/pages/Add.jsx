import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from 'axios';
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { IoIosArrowDropdown } from "react-icons/io";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [subCategory, setSubCategory] = useState("Men");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [stockQuantity, setStockQuantity] = useState(0);

  // Define subcategories for each category
  const subCategoriesMap = {
    Fashion: ["Men", "Women", "Kids"],
    Electronics: ["Mobile", "Laptops", "Accessories", "Others"],
    "Home & Furniture": ["Dining", "Bedroom", "Living Room", "Others"],
    Sports: ["Indoor", "Outdoor", "Others"],
    Books: ["Others"],
    Laptops: ["Others"],
    Accessories: ["Others"],
    Others: ["Others"]
  };

  // Check if category should use sizes or simple stock
  const shouldUseSizes = (cat) => {
    const sizeCategories = ['Fashion', 'Clothing', 'Apparel'];
    return sizeCategories.includes(cat);
  };

  useEffect(() => {
    // Reset subCategory to first option when category changes
    setSubCategory(subCategoriesMap[category][0]);
    
    // Reset stock when category changes
    if (!shouldUseSizes(category)) {
      setSizes([{ size: "One Size", quantity: stockQuantity }]);
    }
  }, [category]);

  // Initialize sizes based on category
  useEffect(() => {
    if (shouldUseSizes(category)) {
      // For fashion: initialize with all sizes
      const initialSizes = ["S", "M", "L", "XL", "XXL"].map(size => ({
        size,
        quantity: 0
      }));
      setSizes(initialSizes);
    } else {
      // For non-fashion: initialize with "One Size"
      setSizes([{ size: "One Size", quantity: stockQuantity }]);
    }
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      
      // Prepare sizes data based on category type
      let sizesToSend = [];
      
      if (shouldUseSizes(category)) {
        // For fashion: send all sizes with quantities
        sizesToSend = sizes
          .filter(item => item.quantity > 0)
          .map(item => ({
            size: item.size, 
            quantity: item.quantity
          }));
      } else {
        // For non-fashion: send "One Size" with total quantity
        sizesToSend = [{
          size: "One Size",
          quantity: stockQuantity
        }];
      }
    
      formData.append("sizes", JSON.stringify(sizesToSend));
      
      // Append images only if they exist
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      if (!token) return toast.error("No token present — please login.");

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setBestseller(false);
        setStockQuantity(0);
        // Reset sizes based on current category
        if (shouldUseSizes(category)) {
          const resetSizes = sizes.map(item => ({ ...item, quantity: 0 }));
          setSizes(resetSizes);
        } else {
          setSizes([{ size: "One Size", quantity: 0 }]);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Axios error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Handle size quantity change for fashion products
  const handleSizeChange = (size, quantity) => {
    setSizes(prev => 
      prev.map(item => 
        item.size === size ? { ...item, quantity: Number(quantity) || 0 } : item
      )
    );
  };

  // Handle stock quantity change for non-fashion products
  const handleStockChange = (quantity) => {
    const newQuantity = Number(quantity) || 0;
    setStockQuantity(newQuantity);
    setSizes([{ size: "One Size", quantity: newQuantity }]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-6 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        {/* Image Upload */}
        <div className="w-full">
          <p className="mb-2 font-medium">Upload Images</p>
          <div className="flex gap-4 flex-wrap">
            {[image1, image2, image3, image4].map((img, i) => (
              <label key={i} htmlFor={`image${i + 1}`} className="cursor-pointer">
                <img
                  className="w-24 h-24 object-cover rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt={`Upload ${i + 1}`}
                />
                <input
                  type="file"
                  id={`image${i + 1}`}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (i === 0) setImage1(file);
                      if (i === 1) setImage2(file);
                      if (i === 2) setImage3(file);
                      if (i === 3) setImage4(file);
                    }
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Name and Description */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent"
            type="text"
            placeholder="Enter product name"
            required
          />
        </div>
        
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent"
            placeholder="Enter product description"
            rows="4"
            required
          />
        </div>

        {/* Category & Subcategory & Price */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Category Dropdown */}
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2   rounded-lg   appearance-none cursor-pointer pr-10"
            >
              {Object.keys(subCategoriesMap).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-2/3 transform -translate-y-1/2 pointer-events-none text-gray-500">
              <IoIosArrowDropdown className="w-4 h-4" />
            </div>
          </div>

          {/* Subcategory Dropdown */}
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent appearance-none cursor-pointer pr-10"
            >
              {subCategoriesMap[category].map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            <div className="absolute right-3 top-2/3 transform -translate-y-1/2 pointer-events-none text-gray-500">
              <IoIosArrowDropdown className="w-4 h-4" />
            </div>
          </div>

          {/* Price Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Price (₹)</label>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent"
              type="number"
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Stock Management - UPDATED: Show appropriate input based on category */}
        {shouldUseSizes(category) ? (
          /* Sizes for Fashion Products */
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Sizes & Stock</label>
            <div className="flex gap-4 flex-wrap">
              {sizes.map((sizeObj) => (
                <div key={sizeObj.size} className="flex flex-col items-center">
                  <p className="mb-2 font-medium text-sm">{sizeObj.size}</p>
                  <input
                    type="number"
                    placeholder="0"
                    min={0}
                    className="w-20 px-2 py-2 border border-gray-300 rounded text-center  focus:border-transparent"
                    value={sizeObj.quantity}
                    onChange={(e) => handleSizeChange(sizeObj.size, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Set 0 for out of stock. Total stock: {sizes.reduce((total, size) => total + (size.quantity || 0), 0)} Products
            </p>
          </div>
        ) : (
          /* Simple Stock for Non-Fashion Products */
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="0"
                min={0}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={stockQuantity}
                onChange={(e) => handleStockChange(e.target.value)}
              />
              <span className="text-sm text-gray-500">Products in stock</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Set total quantity available for this product
            </p>
          </div>
        )}

        {/* Bestseller */}
        <div className="flex items-center gap-2">
          <input
            onChange={() => setBestseller(prev => !prev)}
            checked={bestseller}
            type="checkbox"
            id="bestseller"
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700 cursor-pointer" htmlFor="bestseller">
            Mark as Bestseller
          </label>
        </div>

        <button type="submit" className="px-8 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          ADD PRODUCT
        </button>
      </form>
    </div>
  );
}

export default Add;