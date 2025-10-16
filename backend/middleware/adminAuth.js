import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
   
    
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (authHeader) {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No authentication token provided" 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Admin access required" 
      });
    }

    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Admin auth error:", err.message);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid token" 
    });
  }
};

export default adminAuth;