import express from "express";
import { 
  loginUser, 
  registerUser, 
  getProfile, 
  updateProfile, 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress, 
  toggleWishlist, 
  getWishlist, 
  changePassword, 
  updatePreferences, 
  deleteAccount 
} from "../../controllers/user/userController.js";
import upload from "../../middleware/multer.js";
import authUser from "../../middleware/auth.js";

const userRouter = express.Router();

// Auth Routes (Public)
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Profile Routes (Protected)
userRouter.get('/profile', authUser, getProfile);
userRouter.put('/update-profile', authUser, upload.single('profilePic'), updateProfile);
userRouter.put('/change-password', authUser, changePassword);
userRouter.put('/preferences', authUser, updatePreferences);
userRouter.delete('/delete-account', authUser, deleteAccount); // CAUTION

// Address Routes
userRouter.get('/addresses', authUser, getAddresses);
userRouter.post('/add-address', authUser, addAddress);
userRouter.put('/update-address/:addressId', authUser, updateAddress);
userRouter.delete('/delete-address/:addressId', authUser, deleteAddress);
userRouter.put('/set-default-address/:addressId', authUser, setDefaultAddress);

// Wishlist Routes
userRouter.post('/wishlist/toggle', authUser, toggleWishlist);
userRouter.get('/wishlist', authUser, getWishlist);

export default userRouter;
