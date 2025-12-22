import express from "express"
import { 
  placeOrder, 
  placeOrderStripe, 
  userOrders, 
  verifyStripe,
  cancelOrder,
  getOrderDetails
} from '../../controllers/user/orderController.js'
import authUser from "../../middleware/auth.js"

const userOrderRouter = express.Router();

// User routes
userOrderRouter.post('/place', authUser, placeOrder);
userOrderRouter.post('/stripe', authUser, placeOrderStripe);
userOrderRouter.get('/history', authUser, userOrders); // Changed from /user to /history for clarity? Or keep same? keep same for now to minimize frontend break
userOrderRouter.get('/list', authUser, userOrders); // Mapping /list or /user
// Original was /user. Let's keep /user for compatibility or aliasing.
// Wait, separating might break path. Existing frontend uses /api/order/user. 
// I will mount this router at /api/order/user in server.js? No, usually mounted at /api/order.
// So this route should be just /user.

userOrderRouter.get('/user', authUser, userOrders);
userOrderRouter.post('/verifyStripe', authUser, verifyStripe);
userOrderRouter.post('/cancel', authUser, cancelOrder);
userOrderRouter.get('/single/:orderId', authUser, getOrderDetails);

export default userOrderRouter;
