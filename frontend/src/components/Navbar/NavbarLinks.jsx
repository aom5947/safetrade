// components/navbar/NavbarLinks.jsx
import { Link } from "react-router-dom";

function NavbarLinks({ role }) {
    if (role === "seller") {
        return (
            <div className="hidden md:flex items-center gap-1">
                <Link
                    to="/create/product"
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                    ลงขาย
                </Link>
                <Link
                    to="/shop/3"
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                    หน้าร้านค้า
                </Link>
                {/* ทํา outlet  */}
            </div>
        );
    }

    if (role === "admin") {
        return (
            <div className="hidden md:flex items-center gap-1">
                <Link
                    to="/admin"
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 font-medium"
                >
                    Go to Admin Page
                </Link>
            </div>
        );
    }

    if (role === 'buyer') {
        return (
            <>
            </>
            // <div className="hidden md:flex items-center gap-1">
            //     <Link
            //         to="/profile"
            //         className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-600 transition-all duration-200 font-medium"
            //     >
            //         User Profile
            //     </Link>
            // </div>
        );
    }
}

export default NavbarLinks;
