import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency, products } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrderData = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${backendUrl}/api/order/user`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`
          } 
        }
      );

      if (response.data.success) {
        const allOrdersItem = [];
        
        response.data.orders.forEach(order => {
          order.items.forEach(item => {
            const product = products.find(p => p._id === item._id);
            
            if (product) {
             
              const isPaymentPaid = order.status === 'Delivered' ? true : order.payment;
              const paymentStatus = order.status === 'Delivered' ? 'Paid' : (order.payment ? 'Paid' : 'Pending');
              
              const orderItem = {
                ...item,
                image: product.image,
                status: order.status,
                payment: isPaymentPaid, 
                paymentStatus: paymentStatus,
                paymentMethod: order.paymentMethod,
                date: order.date,
                orderId: order._id,
                address: order.address
              };
              allOrdersItem.push(orderItem);
            }
          });
        });
        
        setOrderData(allOrdersItem);
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Load orders error:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Your Orders</h1>

      {orderData.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="text-6xl text-gray-300 mb-4">📦</div>
          <p className="text-gray-500 text-lg mb-2">No orders found.</p>
          <p className="text-gray-400 text-sm">
            Start shopping to see your orders here!
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orderData.map((item, index) => (
            <div
              key={`${item.orderId}-${index}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Product Image & Details */}
                <div className="flex items-start gap-4 flex-1">
                  <img 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border flex-shrink-0" 
                    src={item.image?.[0] || '/placeholder-image.jpg'} 
                    alt={item.name} 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-sm text-gray-600 mb-3">
                      <span>Price: <strong>{currency}{item.price}</strong></span>
                      <span>Quantity: <strong>{item.quantity}</strong></span>
                      <span>Size: <strong>{item.size}</strong></span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Ordered on: <strong>{new Date(item.date).toLocaleDateString()}</strong></p>
                      <p>
                        Payment: <strong>{item.paymentMethod} 
                        <span className={`ml-1 ${item.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          ({item.paymentStatus})
                        </span>
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Status & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col justify-between lg:items-end gap-3 sm:gap-4 lg:gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'Delivered' ? 'bg-green-500' :
                      item.status === 'Shipped' ? 'bg-blue-500' :
                      item.status === 'Packing' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                    <span className="font-medium text-sm sm:text-base">{item.status}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-3 cursor-pointer sm:px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex-1 sm:flex-none">
                      Track Order
                    </button>
                    <button className="px-3 cursor-pointer sm:px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors flex-1 sm:flex-none">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {item.address && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Delivery Address:</p>
                  <p className="text-sm text-gray-600">
                    {item.address.street}, {item.address.city}, {item.address.state} - {item.address.pincode}
                  </p>
                </div>
              )}

              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;