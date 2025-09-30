import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setCategory(prev => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSubCategory(prev => [...prev, e.target.value]);
    }
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (search.trim() !== "") {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

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

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch,products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row px-3 sm:px-10 md:px-20 my-5 gap-5 py-20 border-t'>
      {/* Filter Left Side */}
      <div className='w-full sm:w-60'>
        <p
          onClick={() => setShowFilter(!showFilter)}
          className='my-2 text-lg sm:text-xl flex items-center cursor-pointer gap-2'
        >
          FILTERS
          <img
            className={`h-3 sm:hidden transition-transform duration-300 ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt="dropdown"
          />
        </p>

        <div className={`${showFilter ? 'block' : 'hidden'} sm:block`}>
          {/* Category Filter */}
          <div className='border border-gray-300 pl-5 py-3 mt-4 rounded-md'>
            <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
              <label><input type="checkbox" value='Fashion' onChange={toggleCategory} /> Fashion</label>
              <label><input type="checkbox" value='Electronics' onChange={toggleCategory} /> Electronics</label>
              <label><input type="checkbox" value='Home & Furniture' onChange={toggleCategory} /> Home & Furniture</label>
              <label><input type="checkbox" value='Sports' onChange={toggleCategory} /> Sports</label>
              <label><input type="checkbox" value='Books' onChange={toggleCategory} /> Books</label>
              <label><input type="checkbox" value='Laptops' onChange={toggleCategory} /> Laptops</label>
            </div>

          </div>

          {/* SubCategory Filter */}
          <div className='border border-gray-300 pl-5 py-3 my-5 rounded-md'>
            <p className='mb-3 text-sm font-medium'>TYPE</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
              {/* Fashion */}
              <label><input type="checkbox" value='men' onChange={toggleSubCategory} /> Men</label>
              <label><input type="checkbox" value='women' onChange={toggleSubCategory} /> Women</label>
              <label><input type="checkbox" value='kids' onChange={toggleSubCategory} /> Kids</label>
              

              {/* Electronics */}
              <label><input type="checkbox" value='Mobile' onChange={toggleSubCategory} /> Mobile</label>
              <label><input type="checkbox" value='Laptops' onChange={toggleSubCategory} /> Laptops</label>
              <label><input type="checkbox" value='Accessories' onChange={toggleSubCategory} /> Accessories</label>

              {/* Home & Furniture */}
              <label><input type="checkbox" value='Dining' onChange={toggleSubCategory} /> Dining</label>
              <label><input type="checkbox" value='Bedroom' onChange={toggleSubCategory} /> Bedroom</label>

              {/* Sports */}
              <label><input type="checkbox" value='Outdoor' onChange={toggleSubCategory} /> Outdoor</label>
              <label><input type="checkbox" value='Indoor' onChange={toggleSubCategory} /> Indoor</label>

              {/* Books */}
              <label><input type="checkbox" value='Fiction' onChange={toggleSubCategory} /> Fiction</label>
              <label><input type="checkbox" value='Non-Fiction' onChange={toggleSubCategory} /> Non-Fiction</label>
            </div>

          </div>

          {/* Sort */}
          <p className='mb-3 text-sm sm:text-xl font-medium'>SORT</p>
          <div className='border border-gray-300 pl-5 py-3 rounded-md'>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
              <label><input type="radio" name="sort" value="relevant" onChange={handleSortChange} checked={sortType === 'relevant'} /> Relevant</label>
              <label><input type="radio" name="sort" value="low-high" onChange={handleSortChange} checked={sortType === 'low-high'} /> Low to High</label>
              <label><input type="radio" name="sort" value="high-low" onChange={handleSortChange} checked={sortType === 'high-low'} /> High to Low</label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        <div className='flex justify-between text-lg sm:text-2xl mb-4'>
          <Title text1='ALL' text2='COLLECTION' />
        </div>

        {/* Products */}
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-10 '>
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image}
            />
          ))}

        </div>
      </div>
    </div>
  );
}

export default Collection;
