import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from "../App"
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { FiSearch, FiFilter, FiTrendingUp, FiPackage, FiUsers,  } from 'react-icons/fi'
import { FaIndianRupeeSign } from "react-icons/fa6";
import { IoIosArrowDropdown } from "react-icons/io"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      setLoading(true)
      const response = await axios.get(
        `${backendUrl}/api/order/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        setOrders(response.data.orders)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Fetch orders error:", error)
      toast.error(error.response?.data?.message || "Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesStatus =
      statusFilter === 'all' ||
      order.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Chart Data Calculations
  const getChartData = () => {
    const statusCount = {}
    const monthlyRevenue = {}

    orders.forEach(order => {
      // Status distribution
      const status = order.status || 'Unknown'
      statusCount[status] = (statusCount[status] || 0) + 1

      // Monthly revenue
      const orderDate = new Date(order.date)
      const monthYear = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`
      const orderTotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
      monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + orderTotal
    })

    return {
      statusData: Object.entries(statusCount).map(([name, value]) => ({ name, value })),
      revenueData: Object.entries(monthlyRevenue).map(([name, revenue]) => ({ name, revenue }))
    }
  }

  const { statusData, revenueData } = getChartData()

  // Order statistics
  const orderStats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.items?.reduce((orderSum, item) => orderSum + (item.price * item.quantity), 0) || 0), 0),
    pendingOrders: orders.filter(order => ['Pending', 'Processing', 'Packing'].includes(order.status)).length,
    deliveredOrders: orders.filter(order => order.status === 'Delivered').length
  }

  const getProductImage = (item) => {
    if (!item) return assets.parcel_icon;
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    if (item.image) {
      if (Array.isArray(item.image) && item.image.length > 0) {
        return item.image[0];
      }
      return item.image;
    }
    return assets.parcel_icon;
  }

  const statusHandler = async (e, orderId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/order/admin/status`,
        {
          orderId: orderId,
          status: e.target.value
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        toast.success("Order status updated")
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Update status error:", error)
      toast.error(error.response?.data?.message || "Failed to update order status")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800'
      case 'Shipped': return 'bg-blue-100 text-blue-800'
      case 'Packing': return 'bg-yellow-100 text-yellow-800'
      case 'Out for delivery': return 'bg-orange-100 text-orange-800'
      case 'Order Placed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name === 'revenue' ? `${currency}${entry.value.toLocaleString()}` : `${entry.value} Rupees`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Orders Management</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-xl font-bold">Orders Management</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-50 rounded-lg  focus:border-transparent w-full sm:w-64"
              />
            </div>

            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-50 rounded-lg appearance-none  focus:border-transparent w-full cursor-pointer"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="packing">Packing</option>
                <option value="shipped">Shipped</option>
                <option value="out for delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                <IoIosArrowDropdown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Orders</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.totalOrders}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <FiPackage className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">{currency} {orderStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <FaIndianRupeeSign className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending Orders</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.pendingOrders}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <FiTrendingUp className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-400 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Delivered</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.deliveredOrders}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <FiUsers className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold mb-4">Order Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-400">
          <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No orders found</p>
          <p className="text-gray-400 text-sm">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No orders have been placed yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm border border-gray-400 p-4 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 pb-4 border-b border-gray-500">
                <div>
                  <h3 className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                  </p>
                </div >
                <div className="flex flex-col justify-center items-center gap-3 mt-2 lg:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <div className="relative">
                    <select
                      onChange={(e) => statusHandler(e, order._id)}
                      value={order.status}
                      className="p-2 text-sm border border-gray-300 rounded bg-white  focus:border-transparent appearance-none cursor-pointer pr-8"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                      <IoIosArrowDropdown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Content - Products First */}
              <div className="space-y-6">
                {/* Products Section */}
                <div>
                  <h4 className="font-medium mb-3">Products</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <img
                          className="w-12 h-12 object-cover rounded border"
                          src={getProductImage(item)}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = assets.parcel_icon
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                            <span>Qty: {item.quantity}</span>
                            <span>Size: {item.size}</span>
                            <span>Price: {currency} {item.price}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{currency} {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary and Customer Info - AT THE BOTTOM */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Order Summary */}
                  <div className="flex-1 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{currency} {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{currency} 10.00</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2">
                        <span>Total:</span>
                        <span>{currency} {(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 10).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="flex-1 p-4 border rounded-lg border-gray-200 bg-gray-50">
                    <h4 className="font-medium mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-semibold">{order.address?.firstName} {order.address?.lastName}</p>
                        <p className="text-gray-600">{order.address?.phone}</p>
                      </div>
                      <div className='flex gap-8'>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <p className="font-medium text-xs text-gray-500 mb-1">Shipping Address:</p>
                          <p className="text-gray-600 text-xs">
                            {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                          </p>
                        </div>
                        {order.paymentMethod && (
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <p className="font-medium text-xs text-gray-500 mb-1">Payment Method:</p>
                            <p className="text-gray-600 text-xs capitalize">{order.paymentMethod}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders