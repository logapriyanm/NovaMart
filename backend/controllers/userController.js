import validator from "validator";
import bcrypt from "bcrypt";
import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
// --------------------- ADMIN LOGIN ---------------------
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Admin login attempt:", { 
      email, 
      expectedEmail: process.env.ADMIN_EMAIL,
      envLoaded: !!process.env.ADMIN_EMAIL 
    });

    // Check if environment variables are loaded
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error("❌ Admin credentials not found in environment");
      return res.status(500).json({ 
        success: false, 
        message: "Admin configuration error" 
      });
    }

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
        console.log("✅ Admin user created in database");
      }

      const token = jwt.sign({ 
        id: adminUser._id, 
        role: "admin", 
        email: adminUser.email 
      }, process.env.JWT_SECRET, { expiresIn: "7d" });
      
      console.log("✅ Admin login successful");
      
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
    return res.status(401).json({ 
      success: false, 
      message: "Invalid admin credentials" 
    });
    
  } catch (error) {
    console.error("💥 Admin login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login: " + error.message 
    });
  }
};

// --------------------- GET PROFILE ---------------------
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Get default address
    const defaultAddress = user.addresses.find(addr => addr.isDefault) || 
                          (user.addresses.length > 0 ? user.addresses[0] : null);

    const userResponse = {
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      profilePic: user.profilePic || "",
      addresses: user.addresses || [],
      defaultAddress: defaultAddress,
      preferences: user.preferences || {
        emailNotifications: true,
        smsNotifications: false,
        promotionalEmails: true,
        darkMode: false,
        currency: "INR",
        language: "en"
      },
      cartData: user.cartData || {},
      likedProducts: user.likedProducts || [],
      date: user.date
    };
    
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error("Get profile error:", error);
    res.json({ success: false, message: "Error fetching profile" });
  }
};

// --------------------- UPDATE PROFILE ---------------------
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update basic fields from form data or JSON
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.phone !== undefined) user.phone = req.body.phone;

    // Handle profile picture upload
    if (req.file) {
      try {
        console.log("Uploading profile picture to Cloudinary...");
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "user-profiles",
          resource_type: "image",
          transformation: [
            { width: 200, height: 200, crop: "fill" },
            { quality: "auto" },
            { format: "jpg" }
          ]
        });

        console.log("Cloudinary upload result:", result);

        // Delete old profile picture from Cloudinary if exists
        if (user.profilePic && user.profilePic.includes('cloudinary')) {
          try {
            const publicId = user.profilePic.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`user-profiles/${publicId}`);
            console.log("Old profile picture deleted from Cloudinary");
          } catch (deleteError) {
            console.error("Error deleting old profile picture:", deleteError);
          }
        }

        user.profilePic = result.secure_url;

        // Delete local file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        console.log("Profile picture updated successfully");
        
      } catch (uploadError) {
        console.error("Profile picture upload error:", uploadError);
        // Delete local file if upload failed
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload profile picture" 
        });
      }
    }

    await user.save();

    // Get updated user without password
    const updatedUser = await userModel.findById(userId).select("-password");
    
    // Prepare response
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name || "",
      email: updatedUser.email || "",
      phone: updatedUser.phone || "",
      profilePic: updatedUser.profilePic || "",
      addresses: updatedUser.addresses || [],
      preferences: updatedUser.preferences || {},
      cartData: updatedUser.cartData || {},
      likedProducts: updatedUser.likedProducts || [],
      date: updatedUser.date
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------- ADDRESS MANAGEMENT ---------------------

// Get user addresses
const getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      addresses: user.addresses || []
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const { firstName, lastName, street, city, district, state, pincode, phone, isDefault } = req.body;
    
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      street,
      city,
      district,
      state,
      pincode,
      phone,
      isDefault: isDefault || false
    };

    // If setting as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(newAddress);
    await user.save();

    res.json({
      success: true,
      message: "Address added successfully",
      address: newAddress
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { firstName, lastName, street, city, district, state, pincode, phone, isDefault } = req.body;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // If setting as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    address.firstName = firstName;
    address.lastName = lastName;
    address.street = street;
    address.city = city;
    address.district = district;
    address.state = state;
    address.pincode = pincode;
    address.phone = phone;
    address.isDefault = isDefault || false;

    await user.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      address
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();

    res.json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove default from all addresses
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set the specified address as default
    const address = user.addresses.id(addressId);
    if (address) {
      address.isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: "Default address updated successfully"
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------- WISHLIST FUNCTIONS ---------------------
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let updatedLikedProducts;
    if (user.likedProducts.includes(productId)) {
      updatedLikedProducts = user.likedProducts.filter(id => id !== productId);
    } else {
      updatedLikedProducts = [...user.likedProducts, productId];
    }

    user.likedProducts = updatedLikedProducts;
    await user.save();

    res.json({ 
      success: true, 
      message: "Wishlist updated", 
      likedProducts: updatedLikedProducts 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ 
      success: true, 
      likedProducts: user.likedProducts || [] 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------- OTHER USER FUNCTIONS ---------------------

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update preferences
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete profile picture from Cloudinary
    const user = await userModel.findById(userId);
    if (user && user.profilePic) {
      try {
        const publicId = user.profilePic.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`user-profiles/${publicId}`);
      } catch (error) {
        console.error("Error deleting profile picture from Cloudinary:", error);
      }
    }

    await userModel.findByIdAndDelete(userId);
    await orderModel.deleteMany({ userId });

    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { 
  loginUser, 
  toggleWishlist, 
  getWishlist, 
  registerUser, 
  adminLogin, 
  getProfile, 
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  changePassword,
  updatePreferences,
  deleteAccount
};