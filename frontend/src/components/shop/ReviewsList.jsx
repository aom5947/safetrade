import React from 'react';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import EmptyState from './EmptyState';

export default function ReviewsList({ reviews, reviewStats, loading }) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <>
            {/* Review Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                            {reviewStats.average_rating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.round(reviewStats.average_rating)
                                        ? 'fill-orange-500 text-orange-500'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            {reviewStats.total_reviews} รีวิว
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <EmptyState message="ยังไม่มีรีวิว" />
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <ReviewCard key={review.review_id} review={review} />
                    ))}
                </div>
            )}
        </>
    );
}
