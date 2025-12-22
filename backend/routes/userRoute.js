import express from "express";
import {
  registerUser,
  loginUser,
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
  deleteAccount,
  getAllSellers,
  changeSellerStatus
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Admin Routes
userRouter.get("/sellers", adminAuth, getAllSellers);
userRouter.put("/seller-status", adminAuth, changeSellerStatus);

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

export default userRouter;