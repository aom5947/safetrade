import { useState, useEffect } from "react";
import { api } from "@/services/api";

export const useListings = (filter, pagination, sort) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                // ถ้ายังไม่ได้เลือกหมวด
                if (filter.category === "all" || !filter.categorySlug) {
                    setListings([]);
                    setLoading(false);
                    return;
                }

                console.log("🚀 Fetching listings for:", filter.categorySlug);

                const response = await api.get(`/categories/${filter.categorySlug}/listings`, {
                    params: {
                        include_sub: true,
                        page: pagination.page,
                        limit: pagination.limit,
                        sort: sort,
                    },
                });

                console.log("✅ Listings API Response:", response.data);

                if (response.data.success) {
                    setListings(response.data.listings || []);
                    setError(null);
                } else {
                    setError("ไม่พบข้อมูลในหมวดนี้");
                    setListings([]);
                }
            } catch (err) {
                console.error("❌ Error fetching listings:", err);
                setError("ไม่สามารถโหลดประกาศได้");
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [filter.category, filter.categorySlug, pagination.page, pagination.limit, sort]);

    return { listings, loading, error };
};