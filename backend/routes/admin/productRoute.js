import express from "express"
import upload from "../../middleware/multer.js";
import authUser from "../../middleware/auth.js";
import { 
  addProduct, 
  updateProduct, 
  removeProduct, 
  adminListProduct 
} from "../../controllers/admin/productController.js";

const adminProductRouter = express.Router();

// Admin/Seller routes - SECURED via authUser
adminProductRouter.get('/list', authUser, adminListProduct); // was /admin-list

adminProductRouter.post('/add', authUser, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), addProduct);

adminProductRouter.put('/update/:id', authUser, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), updateProduct);

adminProductRouter.delete('/remove/:id', authUser, removeProduct);

export default adminProductRouter;
