import axios from 'axios';
import { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiSearch, FiSave, FiX, FiPackage } from 'react-icons/fi';
import { IoIosArrowDropdown } from 'react-icons/io';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Define categories and subcategories
  const categories = [
    "Fashion", 
    "Electronics", 
    "Home & Furniture", 
    "Sports", 
    "Books", 
    "Laptops", 
    "Accessories", 
    "Others"
  ];

  const subCategoriesMap = {
    "Fashion": ["Men", "Women", "Kids"],
    "Electronics": ["Mobile", "Laptops", "Accessories", "Others"],
    "Home & Furniture": ["Dining", "Bedroom", "Living Room", "Others"],
    "Sports": ["Indoor", "Outdoor", "Others"],
    "Books": ["Fiction", "Non-Fiction", "Educational", "Others"],
    "Laptops": ["Gaming", "Business", "Student", "Others"],
    "Accessories": ["Mobile", "Laptop", "Others"],
    "Others": ["Others"]
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
        setFilteredList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  useEffect(() => {
    let filtered = list;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredList(filtered);
  }, [searchTerm, categoryFilter, list]);

  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backendUrl}/api/product/remove/${ id }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const editProduct = (product) => {
    setEditingProduct({...product});
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("id", editingProduct._id);
      formData.append("name", editingProduct.name);
      formData.append("description", editingProduct.description);
      formData.append("price", editingProduct.price);
      formData.append("category", editingProduct.category);
      formData.append("subCategory", editingProduct.subCategory);
      formData.append("bestseller", editingProduct.bestseller);
      formData.append("sizes", JSON.stringify(editingProduct.sizes));

      const response = await axios.put( 
        `${backendUrl}/api/product/update/${editingProduct._id}`, 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      if (response.data.success) {
        toast.success("Product updated successfully");
        setEditingProduct(null);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Update product error:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleSizeChange = (sizeIndex, quantity) => {
    const updatedSizes = [...editingProduct.sizes];
    updatedSizes[sizeIndex] = {
      ...updatedSizes[sizeIndex],
      quantity: parseInt(quantity) || 0
    };
    setEditingProduct({
      ...editingProduct,
      sizes: updatedSizes
    });
  };

  // Handle simple stock change for non-fashion products
  const handleStockChange = (quantity) => {
    // For non-fashion products, we'll store stock in a "One Size" entry
    const updatedSizes = [{
      size: "One Size",
      quantity: parseInt(quantity) || 0
    }];
    setEditingProduct({
      ...editingProduct,
      sizes: updatedSizes
    });
  };

  // Handle category change in edit form
  const handleCategoryChange = (category) => {
    const newSubCategory = subCategoriesMap[category]?.[0] || "Others";
    setEditingProduct({
      ...editingProduct,
      category,
      subCategory: newSubCategory
    });
  };

  // Handle subcategory change in edit form
  const handleSubCategoryChange = (subCategory) => {
    setEditingProduct({
      ...editingProduct,
      subCategory
    });
  };

  const getCategories = () => {
    const categories = [...new Set(list.map(product => product.category))];
    return categories;
  };

  const getTotalStock = (sizes) => {
    return sizes.reduce((total, size) => total + (size.quantity || 0), 0);
  };

  // Check if product should show sizes or simple stock
  const shouldShowSizes = (category) => {
    const fashionCategories = ['Fashion', 'Clothing', 'Apparel'];
    return fashionCategories.includes(category);
  };

  useEffect(() => {
    fetchList();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Products Management</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products Management</h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{list.length}</p>
        </div>
       
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
          <p className="text-sm text-gray-600">Categories</p>
          <p className="text-2xl font-bold text-gray-900">{getCategories().length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {list.filter(product => getTotalStock(product.sizes) === 0).length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-400 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-50 rounded-lg  focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-50 rounded-lg  focus:border-transparent appearance-none cursor-pointer pr-10"
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
              <IoIosArrowDropdown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden border-gray-300">
        {/* Table Header - Responsive */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b font-semibold text-sm text-gray-600">
          <div className="col-span-2">Image</div>
          <div className="col-span-3">Product Info</div>
          <div className="col-span-1">Category</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-3">Stock</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Products */}
        {filteredList.length === 0 ? (
          <div className="text-center py-12">
            <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No products found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No products available'
              }
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 items-start md:items-center"
            >
              {/* Image */}
              <div className="md:col-span-2">
                <img 
                  className="w-20 h-20 object-cover rounded-lg border mx-auto md:mx-0" 
                  src={item.image?.[0]} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
              </div>
              
              {/* Product Info */}
              <div className="md:col-span-3">
                <p className="font-medium text-gray-900 text-center md:text-left">{item.name}</p>
                
                {item.bestseller && (
                  <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Bestseller
                  </span>
                )}
              </div>
              
              {/* Category */}
              <div className="md:col-span-1 flex justify-center md:justify-start">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {item.category}
                </span>
              </div>
              
              {/* Price */}
              <div className="md:col-span-1 font-semibold text-gray-900 text-center md:text-left">
                {currency}{item.price}
              </div>
              
              {/* Stock - UPDATED: Show sizes for fashion, simple stock for others */}
              <div className="md:col-span-3">
                {shouldShowSizes(item.category) ? (
                  <>
                    <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                      {item.sizes.filter(s => s.quantity > 0).map(s => (
                        <span key={s.size} className="text-xs bg-gray-100 px-2 py-1 rounded border">
                          {s.size}: <strong>{s.quantity}</strong>
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 text-center md:text-left mt-1">
                      Total: {getTotalStock(item.sizes)} Product
                    </div>
                  </>
                ) : (
                  <div className="text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <FiPackage className="w-4 h-4 text-gray-500" />
                      <span className={`font-semibold ${
                        getTotalStock(item.sizes) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getTotalStock(item.sizes)} in stock
                      </span>
                    </div>
                    {getTotalStock(item.sizes) === 0 && (
                      <span className="text-xs text-red-500">Out of stock</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="md:col-span-2 flex justify-center gap-2">
                <button
                  onClick={() => editProduct(item)}
                  className="p-2 text-blue-600 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                  title="Edit Product"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeProduct(item._id)}
                  className="p-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                  title="Delete Product"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal - UPDATED: With dropdowns for category and subcategory */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <form onSubmit={updateProduct} className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent appearance-none cursor-pointer pr-10"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-2/3 transform -translate-y-1/2 pointer-events-none text-gray-500">
                    <IoIosArrowDropdown className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                  <select
                    value={editingProduct.subCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent appearance-none cursor-pointer pr-10"
                    required
                  >
                    {subCategoriesMap[editingProduct.category]?.map(subCategory => (
                      <option key={subCategory} value={subCategory}>{subCategory}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-2/3 transform -translate-y-1/2 pointer-events-none text-gray-500">
                    <IoIosArrowDropdown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="bestseller"
                    checked={editingProduct.bestseller}
                    onChange={e => setEditingProduct({...editingProduct, bestseller: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="bestseller" className="text-sm font-medium text-gray-700">
                    Mark as Bestseller
                  </label>
                </div>
              </div>

              {/* UPDATED: Show sizes for fashion, simple stock for others */}
              {shouldShowSizes(editingProduct.category) ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sizes & Stock</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {editingProduct.sizes.map((size, index) => (
                      <div key={size.size} className="text-center p-3 border rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-600 mb-2">{size.size}</label>
                        <input
                          type="number"
                          min={0}
                          value={size.quantity}
                          onChange={e => handleSizeChange(index, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 text-center">
                      Total Stock: <strong>{getTotalStock(editingProduct.sizes)}</strong> Products
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <div className="flex items-center gap-3">
                    <FiPackage className="w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      value={getTotalStock(editingProduct.sizes)}
                      onChange={e => handleStockChange(e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">Products</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Set total quantity for this product
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center cursor-pointer gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiSave className="w-4 h-4" />
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default List;