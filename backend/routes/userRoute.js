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

export default userRouter;