import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        
        <div className="space-y-4 sm:space-y-0 flex flex-col gap-4 sm:space-x-4 sm:justify-center">
          <button
            onClick={() => window.history.back()}
            className="w-full  sm:w-auto  flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft className="mr-4" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FaHome className="mr-4" />
            Homepage
          </Link>
          
          <Link
            to="/collection"
            className="w-full sm:w-[430px] flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaShoppingBag className="mr-4" />
            Go Shopping
          </Link>
        </div>

        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Can't find what you're looking for?{' '}
            <Link to="/contact" className="text-blue-600 hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;