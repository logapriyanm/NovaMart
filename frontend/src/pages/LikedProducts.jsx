import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";

const LikedProducts = () => {
  const { likedProducts, products, toggleLike, currency } =
    useContext(ShopContext);

  const likedItems = products.filter((p) => likedProducts.includes(p._id));

  return (
    <div className="p-5 md:p-10 lg:p-20">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-center md:text-left">
        ❤️ Your Wishlist
      </h2>

      {likedItems.length === 0 ? (
        <p className="text-gray-500 text-center md:text-left">
          No products in wishlist
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {likedItems.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg p-3 shadow hover:shadow-lg transition flex flex-col"
            >
              <Link to={`/product/${item._id}`} className="flex flex-col flex-grow">
                <img
                  src={item.image[0]}
                  alt={item.name}
                  className="w-full max-h-100   object-cover rounded"
                />
                <h3 className="mt-3 font-medium text-sm md:text-base lg:text-lg line-clamp-1">
                  {item.name}
                </h3>
              </Link>

              <div className="flex justify-between items-center pt-2">
                <p className="text-gray-600 text-sm md:text-base">
                  {currency}
                  {item.price}
                </p>

                <button
                  onClick={() => toggleLike(item._id)}
                  className="p-1 text-red-500 hover:text-red-600 transition"
                >
                  <MdDeleteOutline size={22} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedProducts;
