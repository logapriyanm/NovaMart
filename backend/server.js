// server.js (or your main server file)
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use(express.json());
// server.js - FIX CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Make sure these routes match what your frontend is calling
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter); // This should match your frontend calls to /api/cart/*
app.use('/api/order', orderRouter);

app.get('/', (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log(`Server started on PORT: ${port}`));