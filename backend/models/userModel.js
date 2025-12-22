
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: ""
  },
  cartData: {
    type: Object,
    default: {}
  },
  likedProducts: {
    type: Array,
    default: []
  },
  addresses: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: { 
      type: String,
      required: true
    },
    state: { 
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    promotionalEmails: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    currency: { type: String, default: "INR" },
    language: { type: String, default: "en" }
  },
  phone: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ["user", "admin", "seller"],
    default: "user"
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  shopName: {
    type: String, 
    default: ''
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;