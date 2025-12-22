import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (mode === "signup") {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
          role
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("Account created successfully!");
          toast.success("Account created successfully!");
          if (response.data.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        } else {
          console.log(response.data.message);
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("Logged in successfully!");
          toast.success("Logged in successfully!");
          if (response.data.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (token || savedToken) {
      navigate("/");
    }
  }, [token, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto my-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">
          {mode === "login" ? "Login" : "Sign Up"}
        </p>
      </div>


      {mode === "signup" && (
        <div className="w-full relative">
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            className="w-full px-3 py-2 border border-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name"
            required
          />
        </div>
      )}

      {mode === "signup" && (
        <div className="w-full relative">
          <select
            onChange={(e) => setRole(e.target.value)}
            value={role}
            className="w-full px-3 py-2 border border-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="user">User</option>
            <option value="seller">Seller</option>
          </select>
        </div>
      )}

      <div className="w-full relative">
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          className="w-full px-3 py-2 border border-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          required
        />
      </div>

      <div className="w-full relative">
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type={showPassword ? "text" : "password"}
          className="w-full px-3 py-2 pr-10 border border-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      </div>

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors">
          Forgot password?
        </p>
        {mode === "login" ? (
          <p
            onClick={() => setMode("signup")}
            className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setMode("login")}
            className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors"
          >
            Login here
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-black text-white font-medium px-8 py-3 mt-4 cursor-pointer rounded hover:bg-gray-800 transition-colors w-full"
      >
        {mode === "login" ? "Login" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;