
import express from "express"
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import { 
  addProduct, 
  updateProduct, 
  listProduct, 
  removeProduct, 
  singleProduct, 
  checkStock,
  adminListProduct 
} from "../controllers/productController.js";

const productRouter = express.Router();

// Public routes
productRouter.get('/list', listProduct);
productRouter.get('/single/:id', singleProduct); 

// Protected user routes
productRouter.post('/check-stock', authUser, checkStock);

// Admin/Seller routes - SECURED via authUser (Roles checked in controller)
productRouter.get('/admin-list', authUser, adminListProduct);

productRouter.post('/add', authUser, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), addProduct);

productRouter.put('/update/:id', authUser, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), updateProduct);

productRouter.delete('/remove/:id', authUser, removeProduct);

export default productRouter;