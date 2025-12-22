import userModel from "../../models/userModel.js";

// --------------------- ADMIN: SELLER MANAGEMENT ---------------------

// Get all sellers (pending and approved)
const getAllSellers = async (req, res) => {
  try {
    const sellers = await userModel.find({ role: 'seller' }).select('-password');
    res.json({ success: true, sellers });
  } catch (error) {
    console.error("Get sellers error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve or Reject (delete) seller
const changeSellerStatus = async (req, res) => {
  try {
    const { userId, status } = req.body; // status: 'approved' or 'rejected'
    
    if (status === 'approved') {
      await userModel.findByIdAndUpdate(userId, { isApproved: true });
      res.json({ success: true, message: "Seller approved successfully" });
    } else if (status === 'rejected') {
      await userModel.findByIdAndDelete(userId); 
      res.json({ success: true, message: "Seller application rejected/removed" });
    } else {
      res.json({ success: false, message: "Invalid status action" });
    }
  } catch (error) {
    console.error("Change seller status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getAllSellers, changeSellerStatus };
