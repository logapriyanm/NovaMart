// middleware/auth.js
import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    // Handle token from multiple sources
    let token = req.headers.token || 
                req.headers.authorization?.replace("Bearer ", "") ||
                req.headers.Authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set both req.userId and req.user for compatibility
    req.user = { id: decoded.id, ...decoded };
    req.userId= decoded.id;
    
    next();
  } catch (err) {
    console.log("Auth middleware error:", err.message);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authUser;