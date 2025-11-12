import { useEffect, useState } from "react";
import axios from "axios";

export default function useAuthCheck() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setIsAuthenticated(false);
                setIsChecking(false);
                return;
            }

            try {
                const res = await axios.get(
                    "http://localhost:3000/api/v1/users/verify-token",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data?.userId) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Token verification failed:", error);
                setIsAuthenticated(false);
                localStorage.removeItem("token");
            } finally {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, []);

    return { isAuthenticated, isChecking };
}
