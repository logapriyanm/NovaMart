import express from "express"
import {placeOrder, placeOrderStripe,  allOrders, userOrders, updateStatus, verifyStripe } from '../controllers/orderController.js'
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js"

const orderRouter = express.Router();

// Admin Routes
orderRouter.post('/list',adminAuth, allOrders)
orderRouter.post('/status',adminAuth, updateStatus)

// Payment Routes
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)


// User Routes
orderRouter.post('/userorders',authUser,userOrders)

// Verify Payment Routes
orderRouter.post('/verifyStripe',authUser,verifyStripe)


export default orderRouter