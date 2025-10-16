
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



export default userRouter;