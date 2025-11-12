// components/navbar/NavbarActions.jsx
import { useNavigate } from "react-router-dom";
import {
    FaRegCommentDots,
    FaUserCircle,
    FaBars,
    FaTimes,
} from "react-icons/fa";

function NavbarActions({
    role,
    unreadCount,
    menuOpen,
    onChatClick,
    onMenuToggle,
}) {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate("/profile");
    };

    return (
        <div className="flex items-center gap-4">
            {(role === "buyer" || role === "seller") && (
                <>
                    {/* Chat Icon with Badge */}
                    <button
                        onClick={onChatClick}
                        className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                    >
                        <FaRegCommentDots className="text-xl text-gray-600 group-hover:text-blue-600 transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Profile Icon */}
                    <button
                        onClick={handleProfileClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                    >
                        <FaUserCircle className="text-2xl text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                </>
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={onMenuToggle}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
                {menuOpen ? (
                    <FaTimes className="text-xl text-gray-600" />
                ) : (
                    <FaBars className="text-xl text-gray-600" />
                )}
            </button>
        </div>
    );
}

export default NavbarActions;