import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";

// Helper functions for stock (used internally)
const decreaseProductStock = async (orderItems) => {
  try {
    for (const item of orderItems) {
      const product = await productModel.findById(item._id || item.productId);
      if (!product) continue;
      const itemSize = item.size || "One Size";
      const sizeIndex = product.sizes.findIndex(s => s.size === itemSize);
      
      if (sizeIndex !== -1) {
        const currentQuantity = product.sizes[sizeIndex].quantity;
        const orderedQuantity = item.quantity || 1;
        // Logic handled in original controller used to throw error if insufficient.
        // For admin updates (cancellation/refund), we INCREASE stock.
        // This function DECREASES. Used in 'Re-activation'.
         const newQuantity = Math.max(0, currentQuantity - orderedQuantity);
         product.sizes[sizeIndex].quantity = newQuantity;
         await product.save();
      }
    }
  } catch (error) {
    console.error(' Error decreasing product stock:', error);
    throw error;
  }
};

const increaseProductStock = async (orderItems) => {
  try {
    for (const item of orderItems) {
      const product = await productModel.findById(item._id || item.productId);
      if (!product) continue;
      const itemSize = item.size || "One Size";
      const sizeIndex = product.sizes.findIndex(s => s.size === itemSize);
      
      if (sizeIndex !== -1) {
        const currentQuantity = product.sizes[sizeIndex].quantity;
        const orderedQuantity = item.quantity || 1;
        const newQuantity = currentQuantity + orderedQuantity;
        product.sizes[sizeIndex].quantity = newQuantity;
        await product.save();
      }
    }
  } catch (error) {
    console.error(' Error increasing product stock:', error);
    throw error;
  }
};


// Admin/Seller: Get All Orders
const allOrders = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole !== 'admin' && userRole !== 'seller') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const orders = await orderModel.find({})
      .populate('userId', 'name email') 
      .sort({ date: -1 });

    if (userRole === 'admin') {
      return res.json({ success: true, orders });
    }

    // Role is Seller: Filter orders and items
    const sellerProducts = await productModel.find({ owner: userId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id.toString());

    // Filter orders that contain at least one seller product
    const sellerOrders = orders.map(order => {
      // Check if order has relevant items
      const sellerItems = order.items.filter(item => 
        sellerProductIds.includes(item._id.toString())
      );

      if (sellerItems.length > 0) {
        const orderObj = order.toObject(); 
        return {
          ...orderObj,
          items: sellerItems,
        };
      }
      return null;
    }).filter(order => order !== null);
    
    res.json({ success: true, orders: sellerOrders });
  } catch (error) {
    console.error("allOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Admin/Seller: Update Order Status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole !== 'admin' && userRole !== 'seller') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // If Seller, check if they are part of the order
    if (userRole === 'seller') {
        const sellerProducts = await productModel.find({ owner: userId }).select('_id');
        const sellerProductIds = sellerProducts.map(p => p._id.toString());
        
        const isSellerInvolved = order.items.some(item => sellerProductIds.includes(item._id.toString()));
        if (!isSellerInvolved) {
             return res.status(403).json({ success: false, message: "Not authorized to update this order" });
        }
    }

    const previousStatus = order.status;

    if (status === "Cancelled" || status === "Refunded") {
      if (previousStatus !== "Cancelled" && previousStatus !== "Refunded") {
        await increaseProductStock(order.items);
      }
    } else if ((previousStatus === "Cancelled" || previousStatus === "Refunded") && 
               (status !== "Cancelled" && status !== "Refunded")) {
      await decreaseProductStock(order.items);
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } 
    );

    res.json({ 
      success: true, 
      message: "Status Updated Successfully",
      order: updatedOrder 
    });
  } catch (error) {
    console.error(" updateStatus error:", error);
    if (error.message.includes('Insufficient stock') || error.message.includes('Size not available')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export { allOrders, updateStatus };
