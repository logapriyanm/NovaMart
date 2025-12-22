import productModel from "../../models/productModel.js";

// Public List (Approved Only)
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({ isApproved: true });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const productId = req.params.id || req.body.productId; 
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const checkStock = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const product = await productModel.findById(productId);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const sizeInfo = product.sizes.find((s) => s.size === size);
    if (!sizeInfo)
      return res.status(400).json({ success: false, message: "Size not available" });

    res.json({ success: true, stock: sizeInfo.quantity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  listProduct,
  singleProduct,
  checkStock
};
