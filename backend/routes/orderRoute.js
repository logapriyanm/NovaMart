// routes/orderRoute.js - CORRECT ROUTES
import express from "express"
import { 
  placeOrder, 
  placeOrderStripe, 
  allOrders, 
  userOrders, 
  updateStatus, 
  verifyStripe 
} from '../controllers/orderController.js'
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js"

const orderRouter = express.Router();

// User routes - protected with authUser
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.get('/user', authUser, userOrders); // ✅ GET /api/order/user
orderRouter.post('/verifyStripe', authUser, verifyStripe);

// Admin routes - protected with adminAuth
orderRouter.get('/admin/all', adminAuth, allOrders); // ✅ GET /api/order/admin/all
orderRouter.put('/admin/status', adminAuth, updateStatus);

export default orderRouter;