import jwt from "jsonwebtoken"

const authUser = async (req, res, next) => {
  try {
    const token = req.headers.token; // token directly
    if (!token) {
      return res.json({ success: false, message: "Not Authorized, Login Again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded payload {id, role}
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Invalid or expired token" });
  }
};


export default authUser