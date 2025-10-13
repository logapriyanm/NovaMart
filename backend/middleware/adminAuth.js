// middleware/adminAuth.js - UPDATED FOR HARD-CODED CREDENTIALS
import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Check if token has admin role (no database check)
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Admin auth error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default adminAuth;