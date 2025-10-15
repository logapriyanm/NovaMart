
import express from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
  getProfile,
  updateProfile,
  toggleWishlist,
  getWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddresses,
  changePassword,
  updatePreferences,
  deleteAccount
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin-login", adminLogin); 

// Protected routes
userRouter.get("/profile", authUser, getProfile);
userRouter.put("/update-profile", authUser, upload.single("profilePicture"), updateProfile);

// Wishlist routes
userRouter.post("/wishlist/toggle", authUser, toggleWishlist);
userRouter.get("/wishlist", authUser, getWishlist);

// Address routes
userRouter.get('/addresses', authUser, getAddresses);
userRouter.post('/addresses', authUser, addAddress);
userRouter.put('/addresses/:addressId', authUser, updateAddress);
userRouter.delete('/addresses/:addressId', authUser, deleteAddress);
userRouter.patch('/addresses/:addressId/default', authUser, setDefaultAddress);

// Account management routes
userRouter.post('/change-password', authUser, changePassword);
userRouter.put('/preferences', authUser, updatePreferences);
userRouter.delete('/account', authUser, deleteAccount);


userRouter.post('/admin-test', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    

    // Check environment variables
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: "Admin credentials not configured in environment"
      });
    }

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      let adminUser = await userModel.findOne({ email: process.env.ADMIN_EMAIL });
      
      if (!adminUser) {
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
        
        adminUser = new userModel({
          name: "Super Admin",
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: "admin"
        });
        await adminUser.save();
       
      }

      const token = jwt.sign({ 
        id: adminUser._id, 
        role: "admin", 
        email: adminUser.email 
      }, process.env.JWT_SECRET, { expiresIn: "7d" });
      
      
      
      return res.json({ 
        success: true, 
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    }

    
    return res.status(401).json({ 
      success: false, 
      message: "Invalid admin credentials" 
    });
    
  } catch (error) {
    console.error(" Admin test login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
});

export default userRouter;