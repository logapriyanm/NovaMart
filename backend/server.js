// server.js - Check this part
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

// ✅ Make sure these imports are correct
import userRouter from './routes/userRoute.js';
import productRouter from "./routes/productRoute.js";
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

const app = express();
const port = process.env.PORT || 4000;

connectCloudinary();
connectDB();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'https://novamart-ecom.onrender.com',
    'https://novamart-admin.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Make sure routes are mounted correctly
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Debug endpoint to check if routes are working
app.get('/api/debug/routes', (req, res) => {
  res.json({
    message: 'Routes debug',
    userRoutes: [
      'POST /api/user/register',
      'POST /api/user/login', 
      'POST /api/user/admin',
      'POST /api/user/admin-login',
      'GET /api/user/profile',
      'PUT /api/user/update-profile'
    ],
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV
  });
});

app.listen(port, () => {
  console.log(`🚀 Server started on PORT: ${port}`);
  console.log(`📊 Available routes:`);
  console.log(`   POST /api/user/admin`);
  console.log(`   POST /api/user/admin-login`);
  console.log(`   GET /health`);
});