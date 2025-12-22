import { useState } from 'react';
import { FiSave, FiLock, FiGlobe, FiTruck, FiCreditCard, FiBell } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'Store Settings', icon: <FiGlobe /> },
        { id: 'shipping', label: 'Shipping', icon: <FiTruck /> },
        { id: 'payment', label: 'Payments', icon: <FiCreditCard /> },
        { id: 'security', label: 'Security', icon: <FiLock /> },
    ];

    const handleSave = () => {
        toast.success("Settings saved successfully");
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Settings</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Settings Navigation */}
                <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 h-fit overflow-hidden">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-4 mb-4">General Store Settings</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                    <input
                                        type="text"
                                        defaultValue="NovaMart"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                                    <input
                                        type="email"
                                        defaultValue="support@novamart.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
                                        <option>INR (₹)</option>
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
                                        <option>Asia/Kolkata (GMT+5:30)</option>
                                        <option>UTC</option>
                                        <option>America/New_York (GMT-5)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-4 mb-4">Shipping Configuration</h2>
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                                Shipping integration settings are coming soon.
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-4 mb-4">Payment Gateways</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="font-medium">Stripe</div>
                                    <button className="text-blue-600 font-medium">Configure</button>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="font-medium">Razorpay</div>
                                    <button className="text-blue-600 font-medium">Configure</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold border-b pb-4 mb-4">Security Settings</h2>
                            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                                Two-factor authentication and other security features.
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t flex justify-end">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            <FiSave />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
