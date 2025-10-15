
import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: [String],
        required: true,
        validate: [array => array.length > 0, 'At least one image is required']
    },
    category: { 
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    sizes: [
      {
        size: { 
          type: String, 
          required: true,
          trim: true
        },
        quantity: { 
          type: Number, 
          default: 0,
          min: 0
        }
      }
    ],
    bestseller: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });


productsSchema.pre('save', function(next) {
  if (this.sizes && Array.isArray(this.sizes)) {
    
    this.sizes = this.sizes.filter(sizeObj => 
      sizeObj && sizeObj.size && sizeObj.size.trim() !== ""
    );
  }
  next();
});


productsSchema.virtual('totalStock').get(function() {
  return this.sizes.reduce((total, size) => total + (size.quantity || 0), 0);
});


productsSchema.methods.decreaseStock = function(size, quantity) {
  const sizeObj = this.sizes.find(s => s.size === size);
  if (sizeObj && sizeObj.quantity >= quantity) {
    sizeObj.quantity -= quantity;
    return true;
  }
  return false;
};

const productModel = mongoose.models.Product || mongoose.model("Product", productsSchema);
export default productModel;