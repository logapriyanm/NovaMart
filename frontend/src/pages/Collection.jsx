import { useContext, useEffect, useState, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { 
    products, 
    search, 
    // Filter states and functions from context
    category,
    subCategory,
    sortType,
    priceRange,
    maxPrice,
    toggleCategory,
    toggleSubCategory,
    handleSortChange,
    handlePriceChange,
    clearAllFilters,
    getActiveFilterCount
  } = useContext(ShopContext);
  
  const [filterProducts, setFilterProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dropdown states - Only for desktop
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subCategoryOpen, setSubCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  // Optimized filter function
  const applyFilter = useCallback(() => {
    let productsCopy = [...products];

    // Search filter
    if (search.trim() !== "") {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    // SubCategory filter
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }

    // Price range filter
    productsCopy = productsCopy.filter(item => 
      item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    setFilterProducts(productsCopy);
  }, [products, search, category, subCategory, priceRange]);

  const sortProduct = () => {
    let fpCopy = [...filterProducts];

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;

      default: // relevant
        applyFilter();
        break;
    }
  };

  // Get display text for sort dropdown
  const getSortDisplayText = () => {
    switch (sortType) {
      case 'low-high': return 'Low to High';
      case 'high-low': return 'High to Low';
      default: return 'Relevant';
    }
  };

  // Get display text for price range
  const getPriceDisplayText = () => {
    if (priceRange[0] === 0 && priceRange[1] === maxPrice) {
      return 'All Prices';
    }
    return `₹${priceRange[0].toLocaleString()} - ₹${priceRange[1].toLocaleString()}`;
  };

  // Effects
  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false);
    }
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50 md:pt-14 pt-6">
      <div className='flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8 xl:px-12 gap-6 lg:py-20 py-8 bg-gray-50'>
        {/* Filter Sidebar - Desktop only */}
        <div className='hidden lg:block w-64 xl:w-72 lg:sticky lg:top-24 lg:self-start'>
          <div className="space-y-4 lg:max-h-[80vh] lg:overflow-y-auto lg:pb-4">
            {/* Clear Filters Button */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <button
                onClick={clearAllFilters}
                disabled={getActiveFilterCount() === 0}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  getActiveFilterCount() === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                }`}
              >
                Clear All Filters
              </button>
            </div>

            {/* Price Range Filter Dropdown */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                className='w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors'
              >
                <span className='text-sm font-medium'>PRICE: {getPriceDisplayText()}</span>
                <img
                  className={`h-3 transition-transform duration-300 ${priceOpen ? 'rotate-90' : ''}`}
                  src={assets.dropdown_icon}
                  alt="dropdown"
                />
              </button>

              <div className={`${priceOpen ? 'block' : 'hidden'} px-4 pb-4 border-t border-gray-100`}>
                <div className='flex flex-col gap-3 text-sm text-gray-700 pt-3'>
                  {/* Price Range Display */}
                  <div className='flex justify-between text-xs font-medium'>
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>

                  {/* Range Slider */}
                  <div className='space-y-4'>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(parseInt(e.target.value), priceRange[1])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(priceRange[0], parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  {/* Quick Price Buttons */}
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {[
                      [0, 500],
                      [500, 1000],
                      [1000, 2000],
                      [2000, maxPrice]
                    ].map(([min, max]) => (
                      <button
                        key={`${min}-${max}`}
                        onClick={() => handlePriceChange(min, max)}
                        className={`px-3 py-1.5 text-xs border rounded-lg transition-colors flex-1 min-w-[70px] ${
                          priceRange[0] === min && priceRange[1] === max
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        ₹{min}-{max}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePriceChange(0, maxPrice)}
                      className={`px-3 py-1.5 text-xs border rounded-lg transition-colors w-full mt-1 ${
                        priceRange[0] === 0 && priceRange[1] === maxPrice
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      All Prices
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Dropdown */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className='w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors'
              >
                <span className='text-sm font-medium'>CATEGORIES</span>
                <img
                  className={`h-3 transition-transform duration-300 ${categoryOpen ? 'rotate-90' : ''}`}
                  src={assets.dropdown_icon}
                  alt="dropdown"
                />
              </button>

              <div className={`${categoryOpen ? 'block' : 'hidden'} px-4 pb-4 border-t border-gray-100`}>
                <div className='flex flex-col gap-3 text-sm text-gray-700 pt-3'>
                  {['Fashion', 'Electronics', 'Home & Furniture', 'Sports', 'Books', 'Laptops', 'Accessories', 'Others'].map(cat => (
                    <label key={cat} className='flex items-center gap-3 cursor-pointer group'>
                      <input
                        type="checkbox"
                        value={cat}
                        onChange={(e) => toggleCategory(e.target.value)}
                        checked={category.includes(cat)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className='group-hover:text-gray-900 transition-colors'>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SubCategory Filter Dropdown */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <button
                onClick={() => setSubCategoryOpen(!subCategoryOpen)}
                className='w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors'
              >
                <span className='text-sm font-medium'>TYPE</span>
                <img
                  className={`h-3 transition-transform duration-300 ${subCategoryOpen ? 'rotate-90' : ''}`}
                  src={assets.dropdown_icon}
                  alt="dropdown"
                />
              </button>

              <div className={`${subCategoryOpen ? 'block' : 'hidden'} px-4 pb-4 border-t border-gray-100`}>
                <div className='flex flex-col gap-3 text-sm text-gray-700 pt-3'>
                  {/* Fashion */}
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Men' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Men')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Men</span>
                  </label>
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Women' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Women')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Women</span>
                  </label>
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Kids' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Kids')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Kids</span>
                  </label>

                  {/* Electronics */}
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Mobile' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Mobile')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Mobile</span>
                  </label>
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Laptops' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Laptops')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Laptops</span>
                  </label>

                  {/* Home & Furniture */}
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Dining' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Dining')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Dining</span>
                  </label>
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Bedroom' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Bedroom')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Bedroom</span>
                  </label>

                  {/* Sports */}
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Outdoor' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Outdoor')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Outdoor</span>
                  </label>
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Indoor' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Indoor')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Indoor</span>
                  </label>

                  {/* Others */}
                  <label className='flex items-center gap-3 cursor-pointer group'>
                    <input 
                      type="checkbox" 
                      value='Others' 
                      onChange={(e) => toggleSubCategory(e.target.value)} 
                      checked={subCategory.includes('Others')}
                    />
                    <span className='group-hover:text-gray-900 transition-colors'>Others</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className='w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors'
              >
                <span className='text-sm font-medium'>SORT: {getSortDisplayText()}</span>
                <img
                  className={`h-3 transition-transform duration-300 ${sortOpen ? 'rotate-90' : ''}`}
                  src={assets.dropdown_icon}
                  alt="dropdown"
                />
              </button>

              <div className={`${sortOpen ? 'block' : 'hidden'} px-4 pb-4 border-t border-gray-100`}>
                <div className='flex flex-col gap-3 text-sm text-gray-700 pt-3'>
                  {[
                    { value: 'relevant', label: 'Relevant' },
                    { value: 'low-high', label: 'Low to High' },
                    { value: 'high-low', label: 'High to Low' }
                  ].map(option => (
                    <label key={option.value} className='flex items-center gap-3 cursor-pointer group'>
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        onChange={(e) => handleSortChange(e.target.value)}
                        checked={sortType === option.value}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className='group-hover:text-gray-900 transition-colors'>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className='flex-1 min-w-0'>
          {/* Header - Show on all screens */}
          <div className='bg-white rounded-lg shadow-sm p-4 sm:p-2 mb-6'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <Title text1='ALL' text2='COLLECTION' />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 mx-5 md:mx-0 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filterProducts.length > 0 ? (
            <div className='grid grid-cols-1 mx-5 md:mx-0 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
              {filterProducts.map((item, index) => (
                <ProductItem
                  key={item._id}
                  name={item.name}
                  id={item._id}
                  price={item.price}
                  image={item.image}
                />
              ))}
            </div>
          ) : (
            <div className='bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center'>
              <div className='text-gray-400 text-4xl sm:text-6xl mb-4'>🔍</div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>No products found</h3>
              <p className='text-gray-600 text-sm sm:text-base mb-6'>
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearAllFilters}
                className='bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base'
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Collection;