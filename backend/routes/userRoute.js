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

// Address routes - UPDATED TO MATCH FRONTEND
userRouter.get('/addresses', authUser, getAddresses);
userRouter.post('/addresses', authUser, addAddress); // Changed from '/address/add'
userRouter.put('/addresses/:addressId', authUser, updateAddress); // Changed from '/address/update/:addressId'
userRouter.delete('/addresses/:addressId', authUser, deleteAddress); // Changed from '/address/delete/:addressId'
userRouter.patch('/addresses/:addressId/default', authUser, setDefaultAddress); // Changed from PUT to PATCH

// Account management routes
userRouter.post('/change-password', authUser, changePassword);
userRouter.put('/preferences', authUser, updatePreferences);
userRouter.delete('/account', authUser, deleteAccount);


// Add this to your userRoute.js or server.js
userRouter.post('/api/admin/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("🧪 Testing admin login with:", { email });
    
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      let adminUser = await userModel.findOne({ email: process.env.ADMIN_EMAIL });
      
      if (!adminUser) {
        console.log("📝 Creating new admin user in database...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
        
        adminUser = new userModel({
          name: "Super Admin",
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: "admin"
        });
        await adminUser.save();
        console.log("✅ Admin user created successfully");
      } else {
        console.log("✅ Existing admin user found:", adminUser);
      }

      const token = jwt.sign({ 
        id: adminUser._id, 
        role: "admin", 
        email: adminUser.email 
      }, process.env.JWT_SECRET, { expiresIn: "7d" });
      
      console.log("🎫 Token generated with role:", "admin");
      
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

    console.log("❌ Invalid admin credentials");
    return res.json({ 
      success: false, 
      message: "Invalid admin credentials" 
    });
    
  } catch (error) {
    console.error("🧪 Admin test login error:", error);
    res.json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
});

export default userRouter;