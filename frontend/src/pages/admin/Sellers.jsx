import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../../config';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiUser } from 'react-icons/fi';

const Sellers = ({ token }) => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${backendUrl}/api/user/sellers`,
                { headers: { Authorization: `Bearer ${token}` } } // Assuming backend requires `adminAuth` which checks 'token' header or bearer
            );

            // Note: adminAuth middleware usually expects token in 'token' header key based on previous files, 
            // but let's check standard Bearer if updated. 
            // Wait, adminAuth.js (viewed earlier) used `req.headers.token`.
            // Let's stick to consistent header usage. Previous files used `token: token`.
            // BUT `frontend/src/pages/admin/List.jsx` likely uses `token` header.
            // Let's re-verify middleware if needed. For now I'll send both or check standard.
            // Standard axios pattern in this project seems to be custom.

        } catch (error) {
            // ...
        }
        // Reworking fetch to match project pattern
    };

    // Re-writing component with simpler logic first
    return null;
};

// ... Wait, let me write the full file correctly first time.

const SellersPage = ({ token }) => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/api/user/sellers`, {
                headers: { token }
            });
            if (response.data.success) {
                setSellers(response.data.sellers);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId, status) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/user/seller-status`,
                { userId, status },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                fetchSellers();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSellers();
        }
    }, [token]);

    if (loading) {
        return <div className="p-4">Loading sellers...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Seller Applications</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Shop Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Owner Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sellers.map((seller) => (
                            <tr key={seller._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{seller.shopName || "N/A"}</td>
                                <td className="px-6 py-4">{seller.name}</td>
                                <td className="px-6 py-4 text-gray-500">{seller.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${seller.isApproved
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                        {seller.isApproved ? "Active" : "Pending"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {!seller.isApproved && (
                                        <button
                                            onClick={() => handleStatusChange(seller._id, 'approved')}
                                            className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                            title="Approve"
                                        >
                                            <FiCheck size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStatusChange(seller._id, 'rejected')}
                                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        title={seller.isApproved ? "Remove" : "Reject"}
                                    >
                                        <FiX size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sellers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No seller applications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellersPage;
