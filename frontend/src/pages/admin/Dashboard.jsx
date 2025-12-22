import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../../config";
import { toast } from "react-toastify";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp, FiActivity } from "react-icons/fi";

const Dashboard = ({ token }) => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCustomers: 0,
    });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Parallel fetching for better performance
                const [productsRes, ordersRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/product/admin-list`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${backendUrl}/api/order/admin/all`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (productsRes.data.success && ordersRes.data.success) {
                    const products = productsRes.data.products;
                    const orders = ordersRes.data.orders;

                    // Calculate Stats
                    const revenue = orders.reduce((sum, order) => {
                        const orderTotal = order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
                        return sum + orderTotal;
                    }, 0);

                    // Get Unique Customers (based on address phone/email if available, else just order count approximation)
                    // Since we don't have a dedicated customers endpoint yet, we'll extract from orders
                    const uniqueCustomers = new Set(orders.map(order => order.address.email || order.userId)).size;

                    setStats({
                        totalOrders: orders.length,
                        totalRevenue: revenue,
                        totalProducts: products.length,
                        totalCustomers: uniqueCustomers,
                    });

                    // Process Monthly Revenue Data
                    const revenueByMonth = {};
                    orders.forEach(order => {
                        const date = new Date(order.date);
                        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`; // e.g., "Jan 2024"
                        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                        revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + orderTotal;
                    });

                    const revenueChartData = Object.entries(revenueByMonth).map(([name, amount]) => ({
                        name,
                        amount
                    }));
                    setMonthlyRevenue(revenueChartData);

                    // Process Category Distribution Data
                    const categoryCount = {};
                    products.forEach(product => {
                        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
                    });
                    const categoryChartData = Object.entries(categoryCount).map(([name, value]) => ({
                        name,
                        value
                    }));
                    setCategoryData(categoryChartData);

                    // Recent Orders
                    setRecentOrders(orders.slice(0, 5)); // Taking first 5 as they usually come sorted or we assume so. Ideally sort by date desc.
                }
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{currency}{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FiDollarSign size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</p>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <FiShoppingBag size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Products</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</p>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <FiPackage size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Active Customers</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalCustomers}</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <FiUsers size={24} />
                    </div>
                </div>
            </div>

            {/* Major Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend - Takes up 2/3 space */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FiTrendingUp className="text-blue-500" />
                            Revenue Analytics
                        </h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`${currency}${value.toLocaleString()}`, "Revenue"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution - Takes up 1/3 space */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <FiActivity className="text-purple-500" />
                        Product Categories
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
