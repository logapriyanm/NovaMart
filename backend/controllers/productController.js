import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import productModel from "../models/productModel.js";

// Add product

const addProduct = async (req, res) => {
  try {
    //  Check if user is admin
    if (req.admin.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
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

    // Collect uploaded images from req.files
    const images = ["image1", "image2", "image3", "image4"]
      .map((img) => req.files?.[img]?.[0])
      .filter(Boolean);

    let imagesUrl = [];

    if (images.length > 0) {
      // Test Cloudinary config first
      try {
        const testResult = await cloudinary.api.ping();
      } catch (pingError) {
        console.error(" Cloudinary ping failed:", pingError);
      }

      imagesUrl = await Promise.all(
        images.map(async (file, index) => {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products",
              resource_type: "auto",
            });

            // Delete local file
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
                console.log("🗑️ Local file deleted");
              }
            } catch (unlinkError) {
              console.warn(
                " Could not delete local file:",
                unlinkError.message
              );
            }

            return result.secure_url;
          } catch (uploadError) {
            console.error(` Image ${index + 1} upload failed:`, uploadError);
            console.error("Error details:", {
              message: uploadError.message,
              stack: uploadError.stack,
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
    };

    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    console.error(" Add product error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${errors.join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
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

    const product = await productModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Update fields
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

        const repairedSizes = parsedSizes.map((sizeObj) => {
          if (sizeObj && !sizeObj.size) {
            const sizeKeys = Object.keys(sizeObj).filter(
              (key) => !["quantity", "_id", "id"].includes(key)
            );

            if (sizeKeys.length > 0) {
              const repairedSize = {
                size: sizeObj[sizeKeys[0]],
                quantity: sizeObj.quantity || 0,
                _id: sizeObj._id,
              };

              return repairedSize;
            }
          }

          return sizeObj;
        });

        const validSizes = repairedSizes.filter(
          (sizeObj) => sizeObj && sizeObj.size && sizeObj.size.trim() !== ""
        );

        product.sizes = validSizes;
      } catch (parseError) {
        console.warn(" Size parsing failed:", parseError.message);
      }
    }

    // Handle new images if uploaded
    const images = ["image1", "image2", "image3", "image4"]
      .map((img) => req.files?.[img]?.[0])
      .filter(Boolean);

    if (images.length > 0) {
      const imagesUrl = await Promise.all(
        images.map(async (file) => {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products",
              resource_type: "auto",
            });

            // Delete local file
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            } catch (unlinkError) {
              console.warn(
                "⚠️ Could not delete local file:",
                unlinkError.message
              );
            }

            return result.secure_url;
          } catch (uploadError) {
            console.error(" Image upload failed:", uploadError);
            throw uploadError;
          }
        })
      );

      // Replace or add new images
      product.image = [...product.image, ...imagesUrl].slice(0, 4);
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(" Update product error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${errors.join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


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
    const {id} = req.params;
    await productModel.findByIdAndDelete(id);
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
