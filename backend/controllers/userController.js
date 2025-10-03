import validator from "validator";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";

import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
// Helper function to create a token
const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// --------------------- LOGIN USER ---------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken({ id: user._id, role: "user" });
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------- REGISTER USER ---------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Validate password strength
    if (!validator.isStrongPassword(password)) {
      return res.json({
        success: false,
        message:
          "Password must be stronger (min 8 chars, 1 uppercase, 1 number, 1 symbol)",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken({ id: user._id, role: "user" });
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------- ADMIN LOGIN ---------------------
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = createToken({ role: "admin", email });
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ update name if provided
    if (req.body.name) {
      user.name = req.body.name;
    }

    // ✅ handle profilePic
    if (req.file) {
      // remove old pic if exists
      if (user.profilePic) {
        fs.unlink(user.profilePic, (err) => {
          if (err) console.error("Error deleting old profile pic:", err.message);
        });
      }
      user.profilePic = req.file.path;
    }

    // ✅ update address (JSON or FormData)
    const allowedAddressFields = ["street", "city", "state", "zipcode", "country", "phone"];

    if (req.body.address) {
      // JSON payload (from PlaceOrder)
      user.address = {};
      allowedAddressFields.forEach((field) => {
        if (req.body.address[field] !== undefined) {
          user.address[field] = req.body.address[field];
        }
      });
    } else {
      // FormData payload (from ProfilePage edit)
      const hasAddress = allowedAddressFields.some((f) => req.body[`address[${f}]`] !== undefined);

      if (hasAddress) {
        user.address = {};
        allowedAddressFields.forEach((field) => {
          if (req.body[`address[${field}]`] !== undefined) {
            user.address[field] = req.body[`address[${field}]`];
          }
        });
      }
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin, getProfile, updateProfile };
