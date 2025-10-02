import express from "express";
import { registerUser,updateProfile, loginUser, adminLogin, getProfile } from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.get("/profile", authUser, getProfile); // <-- must be here!
userRouter.put("/profile", authUser, updateProfile); 

export default userRouter;
