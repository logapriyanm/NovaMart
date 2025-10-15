import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from "../App"
import { toast } from 'react-toastify'
import { FiUsers, FiMail, FiPhone, FiSearch, FiUser, FiCalendar, FiShoppingBag } from 'react-icons/fi'

const Customers = ({ token }) => {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCustomersFromOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      
      const response = await axios.get(`${backendUrl}/api/order/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const orders = response.data.orders || []
        
        
        const customerMap = new Map()
        
        orders.forEach(order => {
          if (order.address && order.address.email) {
            const email = order.address.email.toLowerCase()
            
            if (!customerMap.has(email)) {
              customerMap.set(email, {
                _id: order.userId || `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || 'Unknown Customer',
                email: order.address.email,
                phone: order.address.phone,
                createdAt: order.date,
                totalOrders: 1,
                lastOrder: order.date
              })
            } else {
             
              const existingCustomer = customerMap.get(email)
              existingCustomer.totalOrders += 1
              if (new Date(order.date) > new Date(existingCustomer.lastOrder)) {
                existingCustomer.lastOrder = order.date
              }
            }
          }
        })

        const customersList = Array.from(customerMap.values())
        setCustomers(customersList)
        
        if (customersList.length === 0) {
          setError('No customers found in orders')
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching customers from orders:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load customer data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      
     
      const response = await axios.get(`${backendUrl}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setCustomers(response.data.customers || [])
        if (response.data.customers.length === 0) {
          setError('No customers found')
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch customers')
      }
    } catch (error) {
      console.log('Customers endpoint not available, falling back to orders data...')
      
      await fetchCustomersFromOrders()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCustomers()
    }
  }, [token])

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  )

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500">Manage your customer database</p>
          </div>
          <div className="w-full sm:w-64 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && customers.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500">Manage your customer database</p>
          </div>
        </div>
        <div className="text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load customers</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchCustomers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={fetchCustomersFromOrders}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Load from Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
        
        <div className="relative w-full sm:w-84">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg + focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No customers in your database yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div key={customer._id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {getInitials(customer.name)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{customer.name}</h3>
                  <p className="text-sm text-gray-500">ID: {customer._id?.slice(-8)}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 truncate">{customer.email}</span>
                </div>
                
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{customer.phone}</span>
                  </div>
                )}

                {customer.createdAt && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 text-xs">
                      Joined {formatDate(customer.createdAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <FiShoppingBag className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-500">Total Orders</span>
                  </div>
                  <span className="font-semibold text-blue-600">{customer.totalOrders || 1}</span>
                </div>
                
                {customer.lastOrder && (
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-gray-400">Last Order</span>
                    <span className="text-gray-500">{formatDate(customer.lastOrder)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

     
      {customers.length > 0 && customers[0]?._id?.includes('customer_') && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <FiUsers className="w-4 h-4" />
            <span>Showing customers extracted from order data</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers