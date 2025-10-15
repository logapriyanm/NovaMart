
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
  checkStock 
} from "../controllers/productController.js";

const productRouter = express.Router();

// Public routes
productRouter.get('/list', listProduct);
productRouter.get('/single/:id', singleProduct); // Changed to GET with params

// Protected user routes
productRouter.post('/check-stock', authUser, checkStock);

// Admin routes - SECURED
productRouter.post('/add', adminAuth, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), addProduct);

productRouter.put('/update/:id', adminAuth, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), updateProduct);

productRouter.delete('/remove/:id', adminAuth, removeProduct);

export default productRouter;