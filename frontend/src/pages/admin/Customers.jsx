import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../../config';
import { toast } from 'react-toastify';
import { FiSearch, FiMail, FiMapPin, FiShoppingBag, FiUser } from 'react-icons/fi';

const Customers = ({ token }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Since we don't have a direct /api/customers endpoint, we'll derive customers from orders for now
    // In a real app, you'd likely have a dedicated endpoint
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${backendUrl}/api/order/admin/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const orders = response.data.orders;
                const uniqueCustomersMap = new Map();

                orders.forEach(order => {
                    const email = order.address.email || `user-${order.userId}@example.com`; // Fallback if no email in address

                    if (!uniqueCustomersMap.has(email)) {
                        uniqueCustomersMap.set(email, {
                            id: order.userId,
                            name: `${order.address.firstName} ${order.address.lastName}`,
                            email: email,
                            phone: order.address.phone,
                            ordersCount: 1,
                            totalSpent: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                            lastOrderDate: new Date(order.date),
                            address: `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zipcode}`
                        });
                    } else {
                        const customer = uniqueCustomersMap.get(email);
                        customer.ordersCount += 1;
                        customer.totalSpent += order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                        const orderDate = new Date(order.date);
                        if (orderDate > customer.lastOrderDate) {
                            customer.lastOrderDate = orderDate;
                        }
                        uniqueCustomersMap.set(email, customer);
                    }
                });

                setCustomers(Array.from(uniqueCustomersMap.values()));
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCustomers();
        }
    }, [token]);

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Customers</h1>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Customers</h1>

                <div className="relative w-full sm:w-64">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Orders</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total Spent</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{customer.name}</p>
                                                    <p className="text-xs text-gray-500 md:hidden">{customer.lastOrderDate.toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FiMail className="w-4 h-4 text-gray-400" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FiMapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate max-w-[200px]">{customer.address}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <FiShoppingBag className="w-4 h-4 text-gray-400" />
                                                {customer.ordersCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            Rs. {customer.totalSpent.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                            {customer.lastOrderDate.toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FiUser className="w-8 h-8 text-gray-300" />
                                            <p>No customers found matching your search</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Customers;
