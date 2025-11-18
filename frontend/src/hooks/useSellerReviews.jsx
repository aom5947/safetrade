import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function useSellerReviews(sellerId, activeTab) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reviewStats, setReviewStats] = useState({
        total_reviews: 0,
        average_rating: 0
    });
    const [pagination, setPagination] = useState({
        limit: 20,
        offset: 0,
        total: 0
    });

    useEffect(() => {
        const fetchReviews = async () => {
            if (!sellerId || activeTab !== 'reviews') return;

            try {
                setLoading(true);

                const response = await api.get(`/sellers/${sellerId}/reviews`, {
                    params: {
                        limit: pagination.limit,
                        offset: pagination.offset
                    }
                });

                if (response.data.success) {
                    setReviews(response.data.data || []);

                    if (response.data.sellerRating) {
                        setReviewStats({
                            average_rating: response.data.sellerRating.average || 0,
                            total_reviews: response.data.sellerRating.count || 0
                        });
                    }

                    if (response.data.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            total: response.data.pagination.total
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [sellerId, activeTab, pagination.offset, pagination.limit]);

    const handlePageChange = (direction) => {
        setPagination(prev => {
            if (direction === 'next') {
                return { ...prev, offset: prev.offset + prev.limit };
            } else {
                return { ...prev, offset: Math.max(0, prev.offset - prev.limit) };
            }
        });
    };

    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return {
        reviews,
        loading,
        reviewStats,
        pagination,
        handlePageChange,
        currentPage,
        totalPages
    };
}
