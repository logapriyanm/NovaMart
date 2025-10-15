
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

// User routes
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.get('/user', authUser, userOrders);
orderRouter.post('/verifyStripe', authUser, verifyStripe);

// Admin routes
orderRouter.get('/admin/all', adminAuth, allOrders);
orderRouter.put('/admin/status', adminAuth, updateStatus);

export default orderRouter;