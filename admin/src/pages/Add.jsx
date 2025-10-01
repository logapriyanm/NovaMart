import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from 'axios';
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { IoIosArrowDropdown } from "react-icons/io";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [subCategory, setSubCategory] = useState("Men");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  // Define subcategories for each category
  const subCategoriesMap = {
    Fashion: ["Men","Women","Kids"],
    Electronics: ["Mobile","Laptops","Accessories","Others"],
    "Home & Furniture": ["Dining","Bedroom","Living Room","Others"],
    Sports: ["Indoor","Outdoor","Others"],
    Books: ["Others"],
    Laptops: ["Others"],
    Accessories: ["Others"],
    Others: ["Others"]
  };

  useEffect(() => {
    // Reset subCategory to first option when category changes
    setSubCategory(subCategoriesMap[category][0]);
  }, [category]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setPrice("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setSizes([]);
        setBestseller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      {/* Image Upload */}
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, i) => (
            <label key={i} htmlFor={`image${i+1}`}>
              <img
                className="w-20"
                src={!img ? assets.upload_area : URL.createObjectURL(img)}
                alt=""
              />
              <input
                type="file"
                id={`image${i+1}`}
                hidden
                onChange={(e) => {
                  if(i === 0) setImage1(e.target.files[0]);
                  if(i === 1) setImage2(e.target.files[0]);
                  if(i === 2) setImage3(e.target.files[0]);
                  if(i === 3) setImage4(e.target.files[0]);
                }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Name and Description */}
      <div className="w-full">
        <p className="mb-2">Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>
      <div className="w-full">
        <p className="mb-2">Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Write content here"
          required
        />
      </div>

      {/* Category & Subcategory & Price */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div className="relative w-full sm:w-[200px]">
          <p className="mb-2">Product category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 appearance-none border rounded"
          >
            {Object.keys(subCategoriesMap).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <IoIosArrowDropdown className="absolute right-3 top-13 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>

        <div className="relative w-full sm:w-[200px]">
          <p className="mb-2">Sub category</p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-3 py-2 appearance-none border rounded"
          >
            {subCategoriesMap[category].map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <IoIosArrowDropdown className="absolute right-3 top-13 -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>

        <div>
          <p className="mb-2">Product price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px] border rounded"
            type="number"
            placeholder="25"
            required
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S","M","L","XL","XXL"].map(size => (
            <div key={size} onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}>
              <p className={`${sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>{size}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bestseller */}
      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller(prev => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">Add to bestseller</label>
      </div>

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">ADD</button>
    </form>
  );
}

export default Add;
