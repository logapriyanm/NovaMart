import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import productModel from "../../models/productModel.js";

// Add product
const addProduct = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    // Permissions check
    if (userRole !== "admin" && userRole !== "seller") {
      return res.status(403).json({ success: false, message: "Not authorized to add products" });
    }

    // Sellers must be approved to add products
    if (userRole === "seller" && !req.user.isApproved) {
        return res.status(403).json({ success: false, message: "Seller account not approved" });
    }

    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    const images = ["image1", "image2", "image3", "image4"]
      .map((img) => req.files?.[img]?.[0])
      .filter(Boolean);

    let imagesUrl = [];

    if (images.length > 0) {
      try {
        imagesUrl = await Promise.all(
          images.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products",
              resource_type: "auto",
            });
             if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return result.secure_url;
          })
        );
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }
    }

    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes);
        parsedSizes = parsedSizes.filter(
          (sizeObj) => sizeObj && sizeObj.size && sizeObj.size.trim() !== ""
        );
      } catch (parseError) {
        parsedSizes = [];
      }
    }

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" || bestseller === true,
      sizes: parsedSizes,
      image: imagesUrl,
      date: Date.now(),
      owner: userId, 
      isApproved: userRole === "admin" ? true : false 
    };

    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: userRole === "admin" ? "Product Added Successfully" : "Product Submitted for Approval",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check ownership
    if (userRole !== "admin" && product.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this product" });
    }

    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (bestseller !== undefined)
      product.bestseller = bestseller === "true" || bestseller === true;

    if (sizes) {
      try {
        const parsedSizes = JSON.parse(sizes);
         const validSizes = parsedSizes.filter(
          (sizeObj) => sizeObj && sizeObj.size && sizeObj.size.trim() !== ""
        );
        product.sizes = validSizes;
      } catch (parseError) {}
    }

    const images = ["image1", "image2", "image3", "image4"]
      .map((img) => req.files?.[img]?.[0])
      .filter(Boolean);

    if (images.length > 0) {
      const imagesUrl = await Promise.all(
        images.map(async (file) => {
           const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
           if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
           return result.secure_url;
        })
      );
      product.image = [...product.image, ...imagesUrl].slice(0, 4);
    }
    
    await product.save();
    res.json({ success: true, message: "Product updated successfully", product });

  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

     // Check ownership
    if (userRole !== "admin" && product.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this product" });
    }

    if (product.image && product.image.length > 0) {
      try {
        const deletePromises = product.image.map((imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          return cloudinary.uploader.destroy(`products/${publicId}`);
        });
        await Promise.all(deletePromises);
      } catch (cloudError) {}
    }

    await productModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Product permanently deleted" });
  } catch (error) {
    console.log("Delete product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin/Seller List
const adminListProduct = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let filter = {};
    if (userRole === "seller") {
      filter = { owner: userId };
    }
    // Admin sees all (empty filter)

    const products = await productModel.find(filter);
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  updateProduct,
  removeProduct,
  adminListProduct
};
