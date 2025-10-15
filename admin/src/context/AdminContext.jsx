// admin/context/AdminContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AdminContext = createContext();

export const AdminContextProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
  });

  axiosInstance.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [token]);

  return (
    <AdminContext.Provider value={{ admin, setAdmin, token, setToken, axiosInstance }}>
      {children}
    </AdminContext.Provider>
  );
};