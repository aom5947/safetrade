import { useState, useEffect } from 'react';
import { api } from '@/services/api'

export const useCreateReview = (listingId) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [existingReview, setExistingReview] = useState(null);

    const checkExistingReview = async () => {
        try {
            const response = await api.get(`/reviews/check/${listingId}`);

            if (response.data.success && response.data.data.hasReviewed) {
                setHasReviewed(true);
                setExistingReview(response.data.data.review);
            }
        } catch (err) {
            console.error('Error checking review:', err);
        }
    };

    const submitReview = async () => {
        if (rating === 0) {
            setError('กรุณาเลือกคะแนน');
            return { success: false };
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/reviews', {
                listingId: parseInt(listingId),
                rating,
                comment: comment.trim() || undefined
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.data.success) {
                setRating(0);
                setComment('');
                setHasReviewed(true);
                return { success: true };
            } else {
                setError(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งรีวิว';
            setError(errorMessage);
            console.error('Error submitting review:', err);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setRating(0);
        setComment('');
        setError(null);
    };

    useEffect(() => {
        if (listingId) {
            checkExistingReview();
        }
    }, [listingId]);

    return {
        rating,
        setRating,
        hoverRating,
        setHoverRating,
        comment,
        setComment,
        loading,
        error,
        setError,
        hasReviewed,
        existingReview,
        submitReview,
        resetForm,
        checkExistingReview
    };
};
