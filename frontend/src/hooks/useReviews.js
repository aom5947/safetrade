import { api } from '@/services/api';
import { useState, useEffect } from 'react';

export const useReviews = (sellerId) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sellerRating, setSellerRating] = useState({ average: 0, count: 0 });

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/reviews/seller/${sellerId}`, {
                params: { limit: 50, offset: 0 }
            });

            if (response.data.success) {
                setReviews(response.data.data);
                setSellerRating(response.data.sellerRating);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการโหลดรีวิว');
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (reviewId) => {
        try {
            const response = await api.delete(`/reviews/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.data.success) {
                await fetchReviews();
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            return { success: false, message: 'เกิดข้อผิดพลาดในการลบรีวิว' };
        }
    };

    const markSpam = async (reviewId, isSpam) => {
        try {
            const response = await api.patch(`/reviews/${reviewId}/spam`, {
                isSpam: !isSpam
            });

            if (response.data.success) {
                await fetchReviews();
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error('Error marking spam:', err);
            return { success: false, message: 'เกิดข้อผิดพลาด' };
        }
    };

    useEffect(() => {
        if (sellerId) {
            fetchReviews();
        }
    }, [sellerId]);

    return {
        reviews,
        loading,
        error,
        sellerRating,
        fetchReviews,
        deleteReview,
        markSpam
    };
};
