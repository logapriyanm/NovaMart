import axios from "axios"
import { useState } from 'react';
import { backendUrl } from "../App";
import { toast } from 'react-toastify'

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all' 
              type="password" 
              placeholder='Enter admin password' 
              required
            />
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