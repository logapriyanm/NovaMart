// server.js - FOR DEPLOYED BACKEND
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

import userRouter from './routes/userRoute.js';
import productRouter from "./routes/productRoute.js";
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

const app = express();
const port = process.env.PORT || 4000;

connectCloudinary();
connectDB();

// ✅ CORS configuration for deployed environment
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'https://novamart-ecom.onrender.com',
    'https://novamart-admin.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// ✅ API Routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// ✅ Essential endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ✅ Admin test endpoint
app.get('/api/admin/test-auth', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send("Novamart API Working with CORS");
});

app.listen(port, () => {
  console.log(`🚀 Server started on PORT: ${port}`);
});