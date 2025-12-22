import orderModel from "../../models/orderModel.js";
import userModel from "../../models/userModel.js";
import productModel from "../../models/productModel.js";
import Stripe from "stripe";

const currency = "inr";
const deliveryCharge = 10;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const decreaseProductStock = async (orderItems) => {
  try {
    for (const item of orderItems) {
      const product = await productModel.findById(item._id || item.productId);
      
      if (!product) {
        console.error(` Product not found: ${item._id || item.productId}`);
        continue;
      }

      const itemSize = item.size || "One Size";
      const sizeIndex = product.sizes.findIndex(s => s.size === itemSize);
      
      if (sizeIndex !== -1) {
        const currentQuantity = product.sizes[sizeIndex].quantity;
        const orderedQuantity = item.quantity || 1;
        
        if (currentQuantity < orderedQuantity) {
          throw new Error(`Insufficient stock for ${product.name} (${itemSize})`);
        }
        
        const newQuantity = Math.max(0, currentQuantity - orderedQuantity);
        product.sizes[sizeIndex].quantity = newQuantity;
        await product.save();
      } else {
        throw new Error(`Size ${itemSize} not available for ${product.name}`);
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

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { items, amount, address } = req.body;

    const enhancedItems = await Promise.all(
      items.map(async (item) => {
        try {
          if (item.image || item.images) {
            return item;
          }
          const product = await productModel.findById(item._id);
          if (product) {
            return {
              ...item,
              image: product.image, 
              images: product.images
            };
          }
          return item; 
        } catch (error) {
          console.error(` Error fetching product ${item._id}:`, error);
          return item; 
        }
      })
    );
    
    await decreaseProductStock(enhancedItems);

    const orderData = {
      userId,
      items: enhancedItems, 
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ 
      success: true, 
      message: "Order placed successfully", 
      orderId: newOrder._id 
    });
  } catch (error) {
    console.error(" placeOrder error:", error);
    if (error.message.includes('Insufficient stock') || error.message.includes('Size not available')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { items, amount, address } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    const origin = req.headers.origin || process.env.CLIENT_URL;

    const enhancedItems = await Promise.all(
      items.map(async (item) => {
        try {
          if (item.image || item.images) { return item; }
          const product = await productModel.findById(item._id);
          if (product) {
            return { ...item, image: product.image, images: product.images };
          }
          return item; 
        } catch (error) { return item; }
      })
    );

    await decreaseProductStock(enhancedItems);

    const orderData = {
      userId,
      items: enhancedItems, 
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = enhancedItems.map((item) => ({
      price_data: {
        currency,
        product_data: { 
          name: `${item.name} (Size: ${item.size || "One Size"})`, 
          images: item.image ? [item.image[0]] : [] 
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

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

    res.json({ success: true, session_url: session.url, order: newOrder });
  } catch (error) {
    console.error(" placeOrderStripe error:", error);
    if (error.message.includes('Insufficient stock') || error.message.includes('Size not available')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyStripe = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

    const { orderId, success } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "Order ID missing" });

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (success === "true") {
      order.payment = true;
      order.status = "Payment Confirmed";
      await order.save();
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await increaseProductStock(order.items);
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed, order removed" });
    }
  } catch (error) {
    console.error(" verifyStripe error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(" userOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId).populate('userId', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    console.error("getOrderDetails error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await orderModel.findOne({ _id: orderId, userId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    const nonCancellableStatuses = ["Shipped", "Out for Delivery", "Delivered"];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    await increaseProductStock(order.items);
    order.status = "Cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  verifyStripe,
  userOrders,
  getOrderDetails,
  cancelOrder
};
