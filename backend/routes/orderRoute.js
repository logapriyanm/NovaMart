
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

// Admin/Seller routes
orderRouter.get('/admin/all', authUser, allOrders);
orderRouter.put('/admin/status', authUser, updateStatus);

export default orderRouter;