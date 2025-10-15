import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FaFacebookF, 
    FaTwitter, 
    FaInstagram, 
    FaLinkedinIn,
    FaPhoneAlt ,
    FaEnvelope,
    FaMapMarkerAlt,
    FaHeadset,
    FaShippingFast,
    FaExchangeAlt,
    FaQuestionCircle
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const companyLinks = [
        { name: "Home", path: "/" },
        { name: "About us", path: "/about" },
        { name: "Delivery", path: "/" },
        { name: "Privacy policy", path: "/" }
    ];

    const socialLinks = [
        { name: "Facebook", icon: <FaFacebookF size={16} />, url: "#" },
        { name: "Twitter", icon: <FaTwitter size={16} />, url: "#" },
        { name: "Instagram", icon: <FaInstagram size={16} />, url: "#" },
        { name: "LinkedIn", icon: <FaLinkedinIn size={16} />, url: "#" }
    ];

    return (
        <div className="p-8 bg-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between gap-10 mb-8">
                   
                    <div className="flex-1 max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-4">NovaMart</h3>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Your one-stop destination for quality products at the best prices. 
                            At NovaMart, we bring you trusted brands, fast delivery, and 
                            a shopping experience designed to make life easier.
                        </p>
                        <div className="flex space-x-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col sm:flex-row gap-10 flex-1 justify-between">
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-4">COMPANY</h4>
                            <ul className="space-y-2">
                                {companyLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link 
                                            to={link.path}
                                            className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center py-1"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-white mb-4">CUSTOMER CARE</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>
                                    <Link to="/" className="hover:text-white transition-colors duration-200 flex items-center gap-2 py-1">
                                        <FaQuestionCircle size={14} />
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/" className="hover:text-white transition-colors duration-200 flex items-center gap-2 py-1">
                                        <FaExchangeAlt size={14} />
                                        Returns & Refunds
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/" className="hover:text-white transition-colors duration-200 flex items-center gap-2 py-1">
                                        <FaShippingFast size={14} />
                                        Shipping Info
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="hover:text-white transition-colors duration-200 flex items-center gap-2 py-1">
                                        <FaHeadset size={14} />
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-white mb-4">GET IN TOUCH</h4>
                            <div className="space-y-4 text-gray-300">
                                <div className="flex items-start gap-3">
                                    <FaPhoneAlt  className="mt-1 text-blue-400" size={16} />
                                    <div>
                                        <p className="font-medium">+91 9876543210</p>
                                        <p className="text-sm text-gray-400">Mon-Sun, 9AM-8PM</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaEnvelope className="mt-1 text-blue-400" size={16} />
                                    <div>
                                        <p className="font-medium">Novamart@gmail.com</p>
                                        <p className="text-sm text-gray-400">We reply within 24 hours</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaMapMarkerAlt className="mt-1 text-blue-400" size={16} />
                                    <div>
                                        <p className="font-medium">Store Location</p>
                                        <p className="text-sm text-gray-400">Find our nearest store</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

               

                {/* Bottom Section */}
                <div className="border-t border-gray-700 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm text-center md:text-left">
                            Copyright {currentYear} © NovaMart - All Rights Reserved
                        </p>
                        <div className="flex gap-6 text-sm text-gray-400">
                            <Link to="/" className="hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/" className="hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                                
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;