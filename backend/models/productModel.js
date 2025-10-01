import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    image:{
        type: Array,
        required:true
    },
    category: { 
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    sizes: {
        type: Array,
        required: true
    },
    bestseller:{
        type: Boolean
    },
    date: {
        type: Number,
        required: true
    }
})

const productModel =mongoose.models.product || mongoose.model("product", productsSchema);

export default productModel