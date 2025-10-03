import express from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
  getProfile,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js"; // <-- add multer
import { updateProfile } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.get("/profile", authUser, getProfile);
userRouter.put("/profile", authUser, upload.single("profilePic"), updateProfile);

export default userRouter;
