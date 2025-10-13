import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { FaRegHeart, FaHeart } from 'react-icons/fa';

const ProductItem = ({ id, image, name, price }) => {
  const { currency, toggleLike, isLiked } = useContext(ShopContext);

  const liked = isLiked(id);

  return (
    <div className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300  group overflow-hidden border border-gray-100">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${id}`} className="block">
          <img
            src={image[0]}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            alt={name}
          />
        </Link>
        
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleLike(id);
          }}
          className="absolute top-3 right-3 p-2 bg-white cursor-pointer bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 hover:scale-110 transition-all duration-200 z-10"
        >
          {liked ? (
            <FaHeart size={18} className="text-red-500" />
          ) : (
            <FaRegHeart size={18} className="text-gray-600 hover:text-red-500" />
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors duration-200 mb-2">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {currency}{price}
          </span>
          
          {/* Rating Stars */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-3 h-3 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="text-xs text-gray-500 ml-1">(0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;