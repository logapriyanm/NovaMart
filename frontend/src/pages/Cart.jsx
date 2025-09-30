import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

import CartTotal from "../components/CartTotal";
import { MdDeleteOutline } from "react-icons/md";

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
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }


  }, [cartItems, products]);

  return (
    <div className="border-t pt-14 md:px-20 px-5 flex flex-col md:flex-row gap-8">
      {/* Left Side - Cart Items */}
      <div className="flex-1">
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>

        <div className="space-y-4">
          {cartData.map((item, index) => {
            const productData = products.find(
              (product) => product._id === item._id
            );
            return (
              <div
                key={index}
                className="p-4 sm:p-6 border border-gray-100 rounded-md bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* Product Info */}
                <div className="flex items-start gap-4 sm:gap-6">
                  <img
                    className="w-16 sm:w-20 rounded"
                    src={productData.image[0]}
                    alt={productData.name}
                  />
                  <div>
                    <p className="text-sm sm:text-lg font-medium">
                      {productData.name}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm sm:text-base">
                      <p>
                        {currency}
                        {productData.price}
                      </p>
                      <p className="px-2 py-0.5 border text-xs sm:text-sm border-gray-300 bg-slate-50 rounded">
                        {item.size}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity & Delete */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <input
                    onChange={(e) =>
                      e.target.value === "" || e.target.value === "0"
                        ? null
                        : updateQuantity(
                          item._id,
                          item.size,
                          Number(e.target.value)
                        )
                    }
                    className="border w-14 sm:w-20 px-2 py-1 text-center rounded"
                    type="number"
                    min={1}
                    defaultValue={item.quantity}
                  />

                  <MdDeleteOutline
                    onClick={() => updateQuantity(item._id, item.size, 0)}
                    className="cursor-pointer hover:opacity-70 "
                    size={28}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side - Cart Summary */}
      <div className="w-full md:w-[320px] lg:w-[380px] border border-gray-100 my-6 md:my-14 rounded-md py-4 px-4 shadow-sm bg-white self-start">
        <CartTotal />
        <div className="w-full flex justify-center ">
          <button onClick={() => navigate('/place-order')} className="bg-primary text-white text-sm sm:text-base my-6 px-6 sm:px-8 py-3 rounded-md hover:bg-gray-800 transition w-full md:w-auto">
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
