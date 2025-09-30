import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { FaRegHeart, FaHeart } from 'react-icons/fa';

const ProductItem = ({ id, image, name, price }) => {
  const { currency, likedProducts, toggleLike, isLiked } = useContext(ShopContext);

  const liked = isLiked(id);

  return (
    <div className="relative text-gray-700    cursor-pointer group">
      {/* Product Image and Link */}
      <Link to={`/product/${id}`} className="overflow-hidden block">
        <img
          src={image[0]}
          className="hover:scale-105 transition-transform w-full"
          alt={name}
        />
      </Link>

      {/* Product Info */}
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">{currency}{price}</p>

      {/* ❤️ Like Button */}
      <button
        onClick={() => toggleLike(id)}
        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-600 transition z-10"
      >
        {liked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
      </button>
    </div>
  );
};

export default ProductItem;
