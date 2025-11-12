import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";

export const useSavedListings = () => {
    const [savedListings, setSavedListings] = useState({});
    const [loadingIds, setLoadingIds] = useState({});
    const [initialLoading, setInitialLoading] = useState(true);
    const token = localStorage.getItem('token');

    // โหลดโพสต์ที่ผู้ใช้เคยบันทึกไว้แล้ว
    useEffect(() => {
        const fetchSavedListings = async () => {
            try {
                const res = await api.get("/saved-listings", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const savedArray = res.data.data || [];
                const savedMap = {};
                savedArray.forEach((item) => {
                    savedMap[item.listing_id] = true;
                });

                setSavedListings(savedMap);
            } catch (error) {
                console.error("Error fetching saved listings:", error);
            } finally {
                setInitialLoading(false);
            }
        };

        if (token) {
            fetchSavedListings();
        }
    }, [token]);

    const handleToggleFavorite = async (e, listing_id) => {
        e.stopPropagation();

        if (loadingIds[listing_id]) return;

        setLoadingIds((prev) => ({ ...prev, [listing_id]: true }));

        const isSaved = savedListings[listing_id] || false;

        try {
            if (!isSaved) {
                await api.post(
                    "/saved-listings",
                    { listingId: listing_id },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setSavedListings((prev) => ({
                    ...prev,
                    [listing_id]: true,
                }));
            } else {
                await api.delete(`/saved-listings/${listing_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setSavedListings((prev) => ({
                    ...prev,
                    [listing_id]: false,
                }));
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || "เกิดข้อผิดพลาด";
            console.error("Favorite error:", error);
            toast.warning(errMsg);
        } finally {
            setLoadingIds((prev) => ({ ...prev, [listing_id]: false }));
        }
    };

    return {
        savedListings,
        loadingIds,
        initialLoading,
        handleToggleFavorite,
    };
};