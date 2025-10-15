import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from "../App"
import { toast } from 'react-toastify'
import { FiTrendingUp, FiShoppingCart, FiPackage, FiUsers, FiClock } from 'react-icons/fi'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [salesData, setSalesData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']


const fetchDashboardData = async () => {
  if (!token) {
    console.log(error.message);
    toast.error("No authentication token found");
    return;
  }

  try {
    setLoading(true);
    
   
    let productsResponse;
    try {
      productsResponse = await axios.get(`${backendUrl}/api/product/list`);
     
    } catch (productsError) {
      console.log(error);
      
      toast.error("Failed to load products");
      return;
    }

   
    let ordersResponse;
    try {
      ordersResponse = await axios.get(`${backendUrl}/api/order/admin/all`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
    } catch (ordersError) {
      
      
      if (ordersError.response?.status === 403) {
        toast.error("Access denied. Not an admin user.");
      } else if (ordersError.response?.status === 401) {
        toast.error("Invalid token. Please login again.");
      } else {
        toast.error("Failed to load orders: " + (ordersError.response?.data?.message || ordersError.message));
      }
      return;
    }

    
    if (productsResponse.data.success && ordersResponse.data.success) {
      const products = productsResponse.data.products || [];
      const orders = ordersResponse.data.orders || [];

     
      // Your data processing code...
      const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = order.items?.reduce((orderSum, item) => 
          orderSum + (item.price * item.quantity), 0) || 0;
        return sum + orderTotal;
      }, 0);

      const pendingOrders = orders.filter(order => 
        order.status && ['Pending', 'Processing', 'Packing'].includes(order.status)
      ).length;

      const customerIds = orders.map(order => order.userId).filter(id => id);
      const uniqueCustomers = new Set(customerIds).size;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: uniqueCustomers,
        pendingOrders,
      });

      // Recent orders
      const sortedOrders = orders.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setRecentOrders(sortedOrders.slice(0, 3));

      // Top products
      const productSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (item.productId) {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                name: item.name || `Product ${item.productId}`,
                quantity: 0,
                revenue: 0
              };
            }
            productSales[item.productId].quantity += item.quantity || 0;
            productSales[item.productId].revenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);
      setTopProducts(topProductsList);

      // Sales data
      const monthlySales = generateMonthlySalesData(orders);
      setSalesData(monthlySales);

      // Category data
      const categorySales = generateCategoryData(products, orders);
      setCategoryData(categorySales);

     
    }
  } catch (error) {
    console.log(error.message);
    
    toast.error("Unexpected error: " + error.message);
  } finally {
    setLoading(false);
  }
};

  // Generate monthly sales data
  const generateMonthlySalesData = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.date)
        return orderDate.getMonth() === index
      })
      
      const revenue = monthOrders.reduce((sum, order) => {
        const orderTotal = order.items?.reduce((orderSum, item) => 
          orderSum + (item.price * item.quantity), 0) || 0
        return sum + orderTotal
      }, 0)

      return {
        name: month,
        revenue: revenue,
        orders: monthOrders.length
      }
    })
  }

  // Generate category data for pie chart
  const generateCategoryData = (products, orders) => {
    const categoryMap = {}
    
    // Initialize categories from products
    products.forEach(product => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = { name: product.category, value: 0 }
      }
    })

    // Calculate sales per category
    orders.forEach(order => {
      order.items?.forEach(item => {
        const product = products.find(p => p._id === item.productId)
        if (product && categoryMap[product.category]) {
          categoryMap[product.category].value += item.quantity
        }
      })
    })

    return Object.values(categoryMap).filter(item => item.value > 0)
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${currency}${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Dashboard</h1>
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
      <h1 className="text-xl font-bold mb-4">Dashboard Overview</h1>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">{currency} {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <FiTrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Orders</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-blue-600">{stats.pendingOrders} pending</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <FiShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Products</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <FiPackage className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Customers</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <FiUsers className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h2 className="font-bold mb-4">Monthly Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
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

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h2 className="font-bold mb-4">Sales Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  name="Orders" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Recent Orders</h2>
            <FiClock className="w-4 h-4 text-gray-400" />
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">No recent orders</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <p className="font-medium">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-gray-600">{order.address?.firstName} {order.address?.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{currency} {order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Top Products</h2>
            <FiTrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">No product data</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-gray-600">{product.quantity} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{currency} {product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard