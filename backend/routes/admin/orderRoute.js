import express from "express"
import { allOrders, updateStatus } from '../../controllers/admin/orderController.js'
import authUser from "../../middleware/auth.js"

const adminOrderRouter = express.Router();

// Admin/Seller routes
adminOrderRouter.get('/all', authUser, allOrders);
adminOrderRouter.put('/status', authUser, updateStatus);

export default adminOrderRouter;
