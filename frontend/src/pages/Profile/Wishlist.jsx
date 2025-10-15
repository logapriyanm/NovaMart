import { useContext, useState } from "react";
import { ShopContext } from "../../context/ShopContext";
import { Link } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { IoIosArrowDropdown } from "react-icons/io";

const Wishlist = () => {
  const { likedProducts, products, toggleLike, currency, addToCart, token } =
    useContext(ShopContext);

  const [selectedSize, setSelectedSize] = useState({});

  // ✅ Show login prompt if no token
  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please login to view your wishlist</p>
        <Link to="/login" className="text-blue-500 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  const likedItems = products.filter((p) => likedProducts.includes(p._id));

  return (
    <div className="">
      {likedItems.length === 0 ? (
        <p className="text-gray-500 text-center md:text-left">
          No products in wishlist
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {likedItems.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg p-3 shadow hover:shadow-lg transition flex flex-col"
            >
              <Link
                to={`/product/${item._id}`}
                className="flex flex-col flex-grow"
              >
                <img
                  src={item.image[0]}
                  alt={item.name}
                  className="w-full h-58 object-center rounded"
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
                  className="p-1 text-red-500 cursor-pointer hover:text-red-600 transition"
                >
                  <MdDeleteOutline size={22} />
                </button>
              </div>

              {/* Size selector with dropdown icon */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="mt-2 relative">
                  <select
                    onChange={(e) =>
                      setSelectedSize((prev) => ({
                        ...prev,
                        [item._id]: e.target.value,
                      }))
                    }
                    value={selectedSize[item._id] || ""}
                    className="w-full border rounded p-2 text-sm appearance-none cursor-pointer pr-8 focus:outline-none "
                  >
                    <option value="">Select size</option>
                    {item.sizes.map((sizeObj) => (
                      <option key={sizeObj.size} value={sizeObj.size}>
                        {sizeObj.size}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                    <IoIosArrowDropdown size={20} />
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={() =>
                  addToCart(
                    item._id,
                    selectedSize[item._id] || item.sizes?.[0]?.size || "default"
                  )
                }
                disabled={item.sizes && item.sizes.length > 0 && !selectedSize[item._id]}
                className={`mt-3 cursor-pointer flex items-center justify-center gap-2 text-white py-2 px-3 rounded transition ${
                  item.sizes && item.sizes.length > 0 && !selectedSize[item._id]
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <MdOutlineShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;