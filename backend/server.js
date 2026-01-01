
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';


import userRouter from './routes/user/userRoute.js';
import adminUserRouter from './routes/admin/userRoute.js';
import userProductRouter from "./routes/user/productRoute.js";
import adminProductRouter from "./routes/admin/productRoute.js";
import cartRouter from './routes/cartRoute.js';
import userOrderRouter from './routes/user/orderRoute.js';
import adminOrderRouter from './routes/admin/orderRoute.js';

const app = express();
const port = process.env.PORT || 5000;

connectCloudinary();
connectDB();


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


app.use('/api/user', userRouter);
app.use('/api/admin/user', adminUserRouter);
app.use('/api/product', userProductRouter);
app.use('/api/admin/product', adminProductRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', userOrderRouter);
app.use('/api/admin/order', adminOrderRouter);


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


app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV
  });
});

// Wait for DB connection before starting server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(port, () => {
      console.log(` Server started on PORT: ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();