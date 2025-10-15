// config/cloudinary.js - ENHANCED VERSION
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

const connectCloudinary = () => {
  try {
  
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_SECRET_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing Cloudinary environment variables: ${missing.join(', ')}`);
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
      secure: true 
    });


    
  } catch (error) {
    console.error(" Cloudinary connection failed:", error.message);
    throw error; // Re-throw to stop server startup
  }
}

export default connectCloudinary