import axios from "axios"
import { useState } from 'react';
import { backendUrl } from "../App";
import { toast } from 'react-toastify'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setLoading(true)

      const response = await axios.post(`${backendUrl}/api/user/admin-login`, {
        email: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        toast.success('Welcome back, Admin!');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className='flex min-h-screen items-center justify-center w-full bg-gradient-to-br from-blue-50 to-gray-100'>
      <div className='bg-white shadow-xl rounded-2xl px-8 py-10 max-w-md w-full mx-4'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Admin Panel</h1>
          <p className='text-gray-600'>Sign in to manage your store</p>
        </div>
        
        <form onSubmit={onSubmitHandler}>
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all' 
              type="email" 
              placeholder='logapriyan@gmail.com' 
              required
            />
          </div>
          
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
            <div className="relative">
              <input 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12' 
                type={showPassword ? "text" : "password"} 
                placeholder='Enter admin password' 
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          <button 
            type='submit' 
            disabled={loading}
            className={`w-full text-white rounded-lg py-3 px-4 font-medium transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login