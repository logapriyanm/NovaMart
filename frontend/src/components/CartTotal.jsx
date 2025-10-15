
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const CartTotal = () => {
  const { getCartAmount, currency, delivery_fee, getCartCount } = useContext(ShopContext);
  
  const subtotal = getCartAmount();
  const total = subtotal + delivery_fee;
  const itemCount = getCartCount();

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Items ({itemCount}):</span>
          <span>{currency}{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Delivery:</span>
          <span>{currency}{delivery_fee.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>{currency}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;