// components/navbar/MobileDrawer.jsx
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

function MobileDrawer({ role, menuOpen, onClose }) {
    return (
        <>
            {/* Mobile Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${menuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex justify-between items-center px-6 py-5 border-b bg-gradient-to-r from-blue-600 to-blue-700">
                    <span className="font-bold text-lg text-white">Menu</span>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-2 p-4">
                    {role === "buyer" && (
                        <Link
                            to="/marketplace"
                            className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                            onClick={onClose}
                        >
                            Marketplace
                        </Link>
                    )}

                    {role === "seller" && (
                        <>
                            <Link
                                to="/seller/Dashboard"
                                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                                onClick={onClose}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/seller/Products"
                                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                                onClick={onClose}
                            >
                                Products
                            </Link>
                            <Link
                                to="/seller/Orders"
                                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                                onClick={onClose}
                            >
                                Orders
                            </Link>
                            <Link
                                to="/seller/SellerProfile"
                                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                                onClick={onClose}
                            >
                                Profile
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}
        </>
    );
}

export default MobileDrawer;