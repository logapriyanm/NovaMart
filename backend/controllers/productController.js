import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import productModel from "../models/productModel.js";

// Add product
// TEMPORARY DEBUG VERSION - Replace your addProduct function with this:
const addProduct = async (req, res) => {
  try {
    console.log("🔍 DEBUG - Starting addProduct...");
    console.log("Admin user:", req.admin);
    console.log("Request files:", req.files);
    console.log("Request body:", req.body);

    // ✅ Check if user is admin
    if (req.admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

    console.log("📦 Received product data:", {
      name, category, subCategory, price, bestseller, sizes
    });

    // Collect uploaded images from req.files
    const images = ["image1", "image2", "image3", "image4"]
      .map((img) => req.files?.[img]?.[0])
      .filter(Boolean);

    console.log("📸 Images found:", images.map(img => ({
      originalname: img.originalname,
      path: img.path,
      size: img.size
    })));

    let imagesUrl = [];

    if (images.length > 0) {
      console.log("🔄 Starting Cloudinary upload...");
      
      // Test Cloudinary config first
      try {
        const testResult = await cloudinary.api.ping();
        console.log("✅ Cloudinary ping successful:", testResult);
      } catch (pingError) {
        console.error("❌ Cloudinary ping failed:", pingError);
      }

      imagesUrl = await Promise.all(
        images.map(async (file, index) => {
          try {
            console.log(`🔄 Uploading image ${index + 1}: ${file.originalname}`);
            console.log("File path:", file.path);
            console.log("File exists:", fs.existsSync(file.path));
            
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products",
              resource_type: "auto"
            });

            console.log(`✅ Image ${index + 1} uploaded:`, result.secure_url);

            // Delete local file
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
                console.log("🗑️ Local file deleted");
              }
            } catch (unlinkError) {
              console.warn("⚠️ Could not delete local file:", unlinkError.message);
            }

            return result.secure_url;
          } catch (uploadError) {
            console.error(`❌ Image ${index + 1} upload failed:`, uploadError);
            console.error("Error details:", {
              message: uploadError.message,
              stack: uploadError.stack
            });
            throw uploadError;
          }
        })
      );
    }

    // Parse sizes JSON
     let parsedSizes = [];
    if (sizes) {
      try { 
        parsedSizes = JSON.parse(sizes);
        
        // ✅ FIX: Filter out invalid sizes here too
        parsedSizes = parsedSizes.filter(sizeObj => 
          sizeObj && sizeObj.size && sizeObj.size.trim() !== ""
        );
        
        console.log("📏 Parsed and filtered sizes:", parsedSizes);
      } catch (parseError) { 
        console.warn("⚠️ Size parsing failed:", parseError.message);
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
    };

    console.log("💾 Saving product to database...");
    const product = new productModel(productData);
    await product.save();

    console.log("✅ Product saved successfully! ID:", product._id);

    res.json({ 
      success: true, 
      message: "Product Added Successfully", 
      product 
    });
    
 } catch (error) {
    console.error("❌ Add product error:", error);
    
    // ✅ Better error handling
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Validation failed: ${errors.join(', ')}` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


// productController.js - FIXED UPDATE FUNCTION
// productController.js - FIXED UPDATE FUNCTION WITH DATA REPAIR
const updateProduct = async (req, res) => {
  try {
    console.log("🔍 DEBUG - Starting updateProduct...");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    console.log("📦 Updating product ID:", id);

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (bestseller !== undefined) product.bestseller = bestseller === "true" || bestseller === true;

    // ✅ FIX: Handle corrupted sizes data
    if (sizes) {
      try {
        const parsedSizes = JSON.parse(sizes);
        console.log("📏 Raw parsed sizes:", parsedSizes);
        
        // ✅ REPAIR corrupted sizes data
        const repairedSizes = parsedSizes.map(sizeObj => {
          // If the object has corrupted keys like "0", "1", etc.
          if (sizeObj && !sizeObj.size) {
            // Try to find the size value in corrupted keys
            const sizeKeys = Object.keys(sizeObj).filter(key => 
              !['quantity', '_id', 'id'].includes(key)
            );
            
            if (sizeKeys.length > 0) {
              // Use the first non-standard key as the size
              const repairedSize = {
                size: sizeObj[sizeKeys[0]], // Use the value of "0", "1", etc.
                quantity: sizeObj.quantity || 0,
                _id: sizeObj._id // Preserve the existing _id if it exists
              };
              console.log("🔧 Repaired size:", repairedSize);
              return repairedSize;
            }
          }
          
          // If it's already a valid size object, return as is
          return sizeObj;
        });
        
        // ✅ Filter out invalid sizes after repair
        const validSizes = repairedSizes.filter(sizeObj => 
          sizeObj && sizeObj.size && sizeObj.size.trim() !== ""
        );
        
        console.log("📏 Valid sizes after repair:", validSizes);
        product.sizes = validSizes;
      } catch (parseError) {
        console.warn("⚠️ Size parsing failed:", parseError.message);
        // Keep existing sizes if parsing fails
      }
    }

    // Handle new images if uploaded
    const images = ["image1", "image2", "image3", "image4"]
      .map((img) => req.files?.[img]?.[0])
      .filter(Boolean);

    if (images.length > 0) {
      console.log("📸 Uploading new images:", images.length);
      const imagesUrl = await Promise.all(
        images.map(async (file) => {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products",
              resource_type: "auto"
            });
            
            // Delete local file
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            } catch (unlinkError) {
              console.warn("⚠️ Could not delete local file:", unlinkError.message);
            }
            
            return result.secure_url;
          } catch (uploadError) {
            console.error("❌ Image upload failed:", uploadError);
            throw uploadError;
          }
        })
      );
      
      // Replace or add new images
      product.image = [...product.image, ...imagesUrl].slice(0, 4);
    }

    await product.save();
    console.log("✅ Product updated successfully:", product._id);
    
    res.json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    console.error("❌ Update product error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Validation failed: ${errors.join(', ')}` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// List, remove, single, checkStock remain unchanged
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
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
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const sizeInfo = product.sizes.find((s) => s.size === size);
    if (!sizeInfo)
      return res
        .status(400)
        .json({ success: false, message: "Size not available" });

    res.json({ success: true, stock: sizeInfo.quantity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  updateProduct,
  checkStock,
  listProduct,
  removeProduct,
  singleProduct,
};
