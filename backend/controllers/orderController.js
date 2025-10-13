import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from "stripe";

const currency = "inr";
const deliveryCharge = 10;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------
// Stock Management Functions
// ---------------------
const decreaseProductStock = async (orderItems) => {
  try {
    console.log("📦 Decreasing stock for order items:", orderItems);
    
    for (const item of orderItems) {
      const product = await productModel.findById(item._id || item.productId);
      
      if (!product) {
        console.error(`❌ Product not found: ${item._id || item.productId}`);
        continue;
      }

      // Determine the size to use
      const itemSize = item.size || "One Size";
      
      // Find the size and decrease quantity
      const sizeIndex = product.sizes.findIndex(s => s.size === itemSize);
      
      if (sizeIndex !== -1) {
        const currentQuantity = product.sizes[sizeIndex].quantity;
        const orderedQuantity = item.quantity || 1;
        
        if (currentQuantity < orderedQuantity) {
          console.error(`❌ Insufficient stock for ${product.name} (${itemSize}): ${currentQuantity} available, ${orderedQuantity} ordered`);
          throw new Error(`Insufficient stock for ${product.name} (${itemSize})`);
        }
        
        const newQuantity = Math.max(0, currentQuantity - orderedQuantity);
        product.sizes[sizeIndex].quantity = newQuantity;
        
        console.log(`✅ Decreased stock for ${product.name} (${itemSize}): ${currentQuantity} -> ${newQuantity}`);
        
        await product.save();
      } else {
        console.error(`❌ Size ${itemSize} not found for product ${product.name}`);
        throw new Error(`Size ${itemSize} not available for ${product.name}`);
      }
    }
    
    console.log("✅ Stock decrease completed successfully");
  } catch (error) {
    console.error('❌ Error decreasing product stock:', error);
    throw error;
  }
};

const increaseProductStock = async (orderItems) => {
  try {
    console.log("📦 Increasing stock for order items:", orderItems);
    
    for (const item of orderItems) {
      const product = await productModel.findById(item._id || item.productId);
      
      if (!product) {
        console.error(`❌ Product not found: ${item._id || item.productId}`);
        continue;
      }

      // Determine the size to use
      const itemSize = item.size || "One Size";
      
      // Find the size and increase quantity
      const sizeIndex = product.sizes.findIndex(s => s.size === itemSize);
      
      if (sizeIndex !== -1) {
        const currentQuantity = product.sizes[sizeIndex].quantity;
        const orderedQuantity = item.quantity || 1;
        const newQuantity = currentQuantity + orderedQuantity;
        
        product.sizes[sizeIndex].quantity = newQuantity;
        
        console.log(`✅ Increased stock for ${product.name} (${itemSize}): ${currentQuantity} -> ${newQuantity}`);
        
        await product.save();
      } else {
        console.error(`❌ Size ${itemSize} not found for product ${product.name}`);
      }
    }
    
    console.log("✅ Stock increase completed successfully");
  } catch (error) {
    console.error('❌ Error increasing product stock:', error);
    throw error;
  }
};

// ---------------------
// Cash On Delivery
// ---------------------
const placeOrder = async (req, res) => {
  try {
    console.log("🔍 DEBUG - Starting placeOrder...");
    
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { items, amount, address } = req.body;

    // ✅ IMPORTANT: Fetch complete product data to get images
    const enhancedItems = await Promise.all(
      items.map(async (item) => {
        try {
          // If the item already has image data, use it
          if (item.image || item.images) {
            return item;
          }
          
          // Otherwise, fetch the product from database to get images
          const product = await productModel.findById(item._id);
          
          if (product) {
            return {
              ...item,
              image: product.image, // Add image data from product
              images: product.images
            };
          }
          return item; // Return original item if product not found
        } catch (error) {
          console.error(`❌ Error fetching product ${item._id}:`, error);
          return item; // Return original item if error
        }
      })
    );

    console.log("🖼️ Enhanced items with images:", enhancedItems);

    // ✅ DECREASE STOCK BEFORE CREATING ORDER
    await decreaseProductStock(enhancedItems);

    const orderData = {
      userId,
      items: enhancedItems, // Use enhanced items with images
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    };

    console.log("💾 Creating order with data:", orderData);

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ 
      success: true, 
      message: "Order placed successfully", 
      orderId: newOrder._id 
    });
  } catch (error) {
    console.error("❌ placeOrder error:", error);
    
    // If stock decrease failed, return specific error
    if (error.message.includes('Insufficient stock') || error.message.includes('Size not available')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ---------------------
// Stripe Payment
// ---------------------
const placeOrderStripe = async (req, res) => {
  try {
    console.log("🔍 DEBUG - Starting placeOrderStripe...");
    console.log("User from auth:", req.user);

    // ✅ Get userId from authenticated user
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { items, amount, address } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    const origin = req.headers.origin || process.env.CLIENT_URL;

    // ✅ IMPORTANT: Fetch complete product data to get images
    const enhancedItems = await Promise.all(
      items.map(async (item) => {
        try {
          // If the item already has image data, use it
          if (item.image || item.images) {
            return item;
          }
          
          // Otherwise, fetch the product from database to get images
          const product = await productModel.findById(item._id);
          
          if (product) {
            return {
              ...item,
              image: product.image, // Add image data from product
              images: product.images
            };
          }
          return item; // Return original item if product not found
        } catch (error) {
          console.error(`❌ Error fetching product ${item._id}:`, error);
          return item; // Return original item if error
        }
      })
    );

    console.log("🖼️ Enhanced items with images:", enhancedItems);

    // ✅ DECREASE STOCK BEFORE CREATING ORDER
    await decreaseProductStock(enhancedItems);

    const orderData = {
      userId,
      items: enhancedItems, // ✅ Use enhanced items with images
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    };

    console.log("💾 Creating Stripe order with data:", orderData);

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = enhancedItems.map((item) => ({
      price_data: {
        currency,
        product_data: { 
          name: `${item.name} (Size: ${item.size || "One Size"})`, // ✅ Include size in product name
          images: item.image ? [item.image[0]] : [] // ✅ Add product images to Stripe
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery charge
    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charges" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString()
      }
    });

    console.log("✅ Stripe session created:", session.id);

    res.json({ 
      success: true, 
      session_url: session.url, 
      order: newOrder 
    });
  } catch (error) {
    console.error("❌ placeOrderStripe error:", error);
    
    // If stock decrease failed, return specific error
    if (error.message.includes('Insufficient stock') || error.message.includes('Size not available')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ---------------------
// Verify Stripe Payment
// ---------------------
const verifyStripe = async (req, res) => {
  try {
    console.log("🔍 DEBUG - Starting verifyStripe...");
    console.log("User from auth:", req.user);

    // ✅ Get userId from authenticated user
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { orderId, success } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID missing" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Compare with userId from authenticated user
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (success === "true") {
      order.payment = true;
      order.status = "Payment Confirmed";
      await order.save();

      // Clear user's cart after successful payment
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      
      console.log("✅ Stripe payment verified successfully");
      
      res.json({ 
        success: true, 
        message: "Payment successful" 
      });
    } else {
      // ✅ INCREASE STOCK BACK IF PAYMENT FAILED
      await increaseProductStock(order.items);
      
      await orderModel.findByIdAndDelete(orderId);
      console.log("❌ Stripe payment failed, order removed and stock restored");
      
      res.json({ 
        success: false, 
        message: "Payment failed, order removed" 
      });
    }
  } catch (error) {
    console.error("❌ verifyStripe error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ---------------------
// Admin: Get All Orders
// ---------------------
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})
      .populate('userId', 'name email') // Populate user info
      .sort({ date: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error("allOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------
// User: Get Orders
// ---------------------
const userOrders = async (req, res) => {
  try {
    // ✅ Get userId from authenticated user
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    console.log("📦 Fetching orders for user:", userId);

    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    
    res.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error("❌ userOrders error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ---------------------
// Admin: Update Order Status
// ---------------------
const updateStatus = async (req, res) => {
  try {
    console.log("🔍 DEBUG - Starting updateStatus...");
    console.log("Request body:", req.body);

    // ✅ Get orderId and status from request body
    const { orderId, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID missing" });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    console.log(`🔄 Updating order ${orderId} to status: ${status}`);

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const previousStatus = order.status;

    // ✅ Handle stock management based on status changes
    if (status === "Cancelled" || status === "Refunded") {
      // If order is cancelled or refunded, increase stock back
      if (previousStatus !== "Cancelled" && previousStatus !== "Refunded") {
        await increaseProductStock(order.items);
        console.log("✅ Stock restored due to order cancellation/refund");
      }
    } else if ((previousStatus === "Cancelled" || previousStatus === "Refunded") && 
               (status !== "Cancelled" && status !== "Refunded")) {
      // If order was cancelled/refunded and is now being reactivated, decrease stock again
      await decreaseProductStock(order.items);
      console.log("✅ Stock decreased again due to order reactivation");
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return the updated document
    );

    console.log("✅ Order status updated successfully");

    res.json({ 
      success: true, 
      message: "Status Updated Successfully",
      order: updatedOrder 
    });
  } catch (error) {
    console.error("❌ updateStatus error:", error);
    
    // If stock management failed, return specific error
    if (error.message.includes('Insufficient stock') || error.message.includes('Size not available')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ---------------------
// Get Single Order Details
// ---------------------
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await orderModel.findById(orderId)
      .populate('userId', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("getOrderDetails error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------
// Cancel Order (User)
// ---------------------
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await orderModel.findOne({ _id: orderId, userId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only allow cancellation for orders that are not shipped/delivered
    const nonCancellableStatuses = ["Shipped", "Out for Delivery", "Delivered"];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    // Increase stock back
    await increaseProductStock(order.items);

    order.status = "Cancelled";
    await order.save();

    res.json({ 
      success: true, 
      message: "Order cancelled successfully" 
    });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  verifyStripe,
  allOrders,
  userOrders,
  updateStatus,
  getOrderDetails,
  cancelOrder,
  decreaseProductStock,
  increaseProductStock
};