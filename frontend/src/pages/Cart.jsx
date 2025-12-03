
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { MdDeleteOutline } from "react-icons/md";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const productData = products.find(
              (product) => product._id === items
            );
            if (productData) {
              tempData.push({
                _id: items,
                size: item,
                quantity: cartItems[items][item],
                productData: productData
              });
            }
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

 
  const getAvailableStock = (productId, size) => {
    const product = products.find(p => p._id === productId);
    if (!product || !product.sizes) return 0;
    
    const sizeInfo = product.sizes.find(s => s.size === size);
    return sizeInfo ? sizeInfo.quantity : 0;
  };

  const handleIncrease = async (id, size, currentQty) => {
    const availableStock = getAvailableStock(id, size);
    
    if (currentQty >= availableStock) {
      toast.error(`Only ${availableStock} items available in stock!`);
      return;
    }
    
    updateQuantity(id, size, currentQty + 1);
  };

  const handleDecrease = (id, size, currentQty) => {
    if (currentQty > 1) {
      updateQuantity(id, size, currentQty - 1);
    }
  };

  const handleRemove = (id, size) => {
    updateQuantity(id, size, 0);
    toast.info("Item removed from cart");
  };

  return (
    <div className="border-t py-14 md:px-20 px-5 flex flex-col md:flex-row gap-8">
      {/* Left Side - Cart Items */}
      <div className="flex-1">
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>

        {cartData.length === 0 ? (
          <div className="text-center min-h-screen flex flex-col justify-center items-center ">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button 
              onClick={() => navigate("/")}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartData.map((item, index) => {
              const availableStock = getAvailableStock(item._id, item.size);
              const isOutOfStock = availableStock === 0;
              const isAtMaxQuantity = item.quantity >= availableStock;

              return (
                <div
                  key={`${item._id}-${item.size}-${index}`}
                  className={`p-4 sm:p-6 border rounded-md bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    isOutOfStock ? 'border-red-200 bg-red-50' : 'border-gray-100'
                  }`}
                >
                  {/* Product Info */}
                  <div className="flex items-start gap-4 sm:gap-6 flex-1">
                    <img
                      className="w-16 sm:w-20 rounded object-cover"
                      src={item.productData.image[0]}
                      alt={item.productData.name}
                    />
                    <div className="flex-1">
                      <p className="text-sm sm:text-lg font-medium mb-2">
                        {item.productData.name}
                      </p>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-blue-600 font-semibold">
                          {currency}
                          {item.productData.price}
                        </p>
                        <span className="px-2 py-1 border text-xs border-gray-300 bg-gray-50 rounded">
                          Size: {item.size}
                        </span>
                      </div>
                      
                      {/* Stock Information */}
                      <div className="flex items-center gap-2">
                        <p className={`text-xs ${
                          isOutOfStock ? 'text-red-600 font-semibold' : 'text-gray-500'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : `In stock: ${availableStock}`}
                        </p>
                        {isAtMaxQuantity && !isOutOfStock && (
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                            Max quantity reached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`flex items-center border rounded overflow-hidden ${
                      isOutOfStock ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <button
                        onClick={() => handleDecrease(item._id, item.size, item.quantity)}
                        className={`px-3 py-1 transition-colors ${
                          isOutOfStock 
                            ? 'bg-red-100 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        disabled={isOutOfStock || item.quantity <= 1}
                      >
                        –
                      </button>
                      <span className={`px-4 select-none min-w-[40px] text-center font-medium ${
                        isOutOfStock ? 'text-red-600' : ''
                      }`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item._id, item.size, item.quantity)}
                        className={`px-3 py-1 transition-colors ${
                          isOutOfStock || isAtMaxQuantity
                            ? 'bg-red-100 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        disabled={isOutOfStock || isAtMaxQuantity}
                      >
                        +
                      </button>
                    </div>

                    <MdDeleteOutline
                      onClick={() => handleRemove(item._id, item.size)}
                      className="cursor-pointer hover:text-red-500 transition-colors text-gray-600"
                      size={24}
                    />
                  </div>

                  {/* Item Total */}
                  <div className="sm:text-right">
                    <p className={`font-semibold ${
                      isOutOfStock ? 'text-red-600' : ''
                    }`}>
                      {currency}
                      {(item.productData.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {currency}
                      {item.productData.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Side - Cart Summary */}
      {cartData.length > 0 && (
        <div className="w-full md:w-[320px] lg:w-[380px] border border-gray-100 my-6 md:my-14 rounded-md py-4 px-4 shadow-sm bg-white self-start">
          <CartTotal />
          <div className="w-full flex justify-center">
            <button
              onClick={() => {
                // Check if any item is out of stock before proceeding
                const outOfStockItems = cartData.filter(item => 
                  getAvailableStock(item._id, item.size) === 0
                );
                
                if (outOfStockItems.length > 0) {
                  toast.error("Please remove out-of-stock items before checkout");
                  return;
                }
                
                navigate("/place-order");
              }}
              className="bg-blue-500 text-white text-sm cursor-pointer sm:text-base my-6 px-6 sm:px-8 py-3 rounded-md hover:bg-blue-600 transition w-full"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;