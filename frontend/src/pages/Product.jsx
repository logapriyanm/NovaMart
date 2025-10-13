import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, toggleLike, isLiked, shouldUseSizes } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Mock reviews data - in real app, this would come from backend
  const [reviews] = useState([
    {
      id: 1,
      user: "John Doe",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent product! Fits perfectly and the quality is amazing.",
      verified: true
    },
    {
      id: 2,
      user: "Jane Smith",
      rating: 4,
      date: "2024-01-10",
      comment: "Good quality material and comfortable to wear. Would recommend!",
      verified: true
    },
    {
      id: 3,
      user: "Mike Johnson",
      rating: 3,
      date: "2024-01-05",
      comment: "Decent product but the sizing runs a bit small.",
      verified: false
    }
  ]);

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  // Star rating component
  const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-yellow-400" />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Fetch product details
  const fetchProductData = () => {
    const foundProduct = products.find((item) => item._id === productId);
    if (foundProduct) {
      setProductData(foundProduct);
      setImage(foundProduct.image[0]);
      
      // Set default size based on product type
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        if (shouldUseSizes(foundProduct.category)) {
          // For fashion products, use the first available size
          setSize(foundProduct.sizes[0].size);
        } else {
          // For non-fashion products, use "One Size"
          setSize("One Size");
        }
      }
    }
  };

  const getAvailableStock = (selectedSize) => {
    if (!productData?.sizes) return 0;
    const sizeInfo = productData.sizes.find(s => s.size === selectedSize);
    return sizeInfo ? sizeInfo.quantity : 0;
  };

  // Update the quantity handlers with stock validation
  const handleIncrease = () => {
    const availableStock = getAvailableStock(size);
    if (quantity >= availableStock) {
      toast.error(`Only ${availableStock} items available in stock!`);
      return;
    }
    setQuantity(prev => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Handle add to cart with proper validation
  const handleAddToCart = () => {
    if (!productData) return;

    // For fashion products, require size selection
    if (shouldUseSizes(productData.category) && !size) {
      toast.error("Please select a size");
      return;
    }

    // For non-fashion products, use "One Size" as default
    const actualSize = shouldUseSizes(productData.category) ? size : "One Size";

    const availableStock = getAvailableStock(actualSize);
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock!`);
      return;
    }

    if (availableStock === 0) {
      toast.error("This item is out of stock");
      return;
    }

    addToCart(productData._id, actualSize, quantity);
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  return productData ? (
    <div className="border-t-2 pt-20 md:px-10 px-5 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded"
                alt=""
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%]">
            <img
              src={image}
              className="w-full h-[400px] md:h-[600px] object-cover rounded-lg"
              alt=""
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>

          {/* Rating Display */}
          <div className="flex items-center gap-4 mt-3">
            <StarRating rating={averageRating} />
            <span className="text-gray-500 text-sm">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>

          <p className="mt-5 text-gray-500 w-4/5">{productData.description}</p>

          {/* Size Selector - Show for fashion products only */}
          {shouldUseSizes(productData.category) && productData.sizes && productData.sizes.length > 0 && (
            <div className="flex flex-col gap-4 my-8">
              <p>Select Size</p>
              <div className="flex gap-2 flex-wrap">
                {productData.sizes.map((sizeObj, index) => (
                  <button
                    onClick={() => setSize(sizeObj.size)}
                    className={`border py-2 px-4 rounded transition-colors ${
                      sizeObj.size === size
                        ? "border-orange-500 bg-orange-100 text-orange-700"
                        : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                    } ${sizeObj.quantity === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    key={index}
                    disabled={sizeObj.quantity === 0}
                  >
                    {sizeObj.size}
                    {sizeObj.quantity === 0 && " (Out of Stock)"}
                  </button>
                ))}
              </div>
              {size && (
                <p className="text-sm text-gray-600">
                  Stock for {size}: {getAvailableStock(size)} available
                </p>
              )}
            </div>
          )}

          {/* Show stock info for non-fashion products */}
          {!shouldUseSizes(productData.category) && productData.sizes && productData.sizes.length > 0 && (
            <div className="my-4">
              <p className="text-sm text-gray-600">
                Stock: {getAvailableStock("One Size")} available
              </p>
              {getAvailableStock("One Size") === 0 && (
                <p className="text-red-500 text-sm">Out of stock</p>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 my-4">
            <p className="text-sm font-medium">Quantity:</p>
            <div className="flex items-center border rounded overflow-hidden">
              <button
                onClick={handleDecrease}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={quantity <= 1}
              >
                –
              </button>
              <span className="px-4 min-w-[40px] text-center">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={quantity >= getAvailableStock(size)}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 my-4 flex-wrap">
            <button
              onClick={handleAddToCart}
              disabled={getAvailableStock(shouldUseSizes(productData.category) ? size : "One Size") === 0}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-white px-8 py-3 text-sm rounded-md transition-colors"
            >
              {getAvailableStock(shouldUseSizes(productData.category) ? size : "One Size") === 0 
                ? "OUT OF STOCK" 
                : `ADD TO CART (${quantity})`
              }
            </button>

            <button
              onClick={() => toggleLike(productData._id)}
              className="border px-6 py-3 text-sm rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {isLiked(productData._id) ? "❤️ Liked" : "🤍 Add to Wishlist"}
            </button>
          </div>

          {/* Product Info */}
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Category:</span>
              <span>{productData.category} › {productData.subCategory}</span>
            </div>
            {productData.bestseller && (
              <div className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                🏆 Bestseller
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Description & Reviews Section */}
      <div className="mt-16 border-t pt-8">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "description"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Reviews & Ratings ({reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "description" && (
            <div className="max-w-4xl">
              <h3 className="text-xl font-semibold mb-4">Product Details</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {productData.description}
                </p>

                {/* Additional product details */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold mb-3">Features</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Premium quality materials</li>
                      <li>Comfortable and durable</li>
                      <li>Available in multiple sizes</li>
                      <li>Easy to maintain and clean</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Specifications</h4>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span>Material:</span>
                        <span>100% Cotton</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Care:</span>
                        <span>Machine Washable</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fit:</span>
                        <span>Regular Fit</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span>2-3 Business Days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-4xl">
              {/* Reviews Summary */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg md:w-64">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {averageRating.toFixed(1)}
                    </div>
                    <StarRating rating={averageRating} />
                    <p className="text-gray-600 text-sm mt-2">
                      Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold mb-4">Customer Reviews</h4>

                  {/* Rating Distribution */}
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(review => review.rating === star).length;
                      const percentage = (count / reviews.length) * 100;

                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-8">{star} star</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                <h4 className="font-semibold">All Reviews</h4>

                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-500" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.user}</span>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} />
                          <span className="text-gray-500 text-sm">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Write Review Button */}
              <div className="mt-8">
                <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  Write a Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default Product;