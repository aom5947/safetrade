// components/navbar/NavbarLogo.jsx
import { useNavigate } from "react-router-dom";

function NavbarLogo() {
    const navigate = useNavigate();

    return (
        <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/marketplace")}
        >
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                SafeTrade
            </span>
        </div>
    );
}

export default NavbarLogo;