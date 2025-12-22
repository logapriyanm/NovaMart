import express from "express"
import authUser from "../../middleware/auth.js";
import { 
  listProduct, 
  singleProduct, 
  checkStock 
} from "../../controllers/user/productController.js";

const userProductRouter = express.Router();

// Public routes
userProductRouter.get('/list', listProduct);
userProductRouter.get('/single/:id', singleProduct); 

// Protected user routes
userProductRouter.post('/check-stock', authUser, checkStock);

export default userProductRouter;
