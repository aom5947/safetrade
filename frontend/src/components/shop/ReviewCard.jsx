import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {review.reviewer_avatar ? (
                        <img
                            src={review.reviewer_avatar}
                            alt={review.reviewer_username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {review.reviewer_username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{review.reviewer_username}</h4>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating
                                        ? 'fill-orange-500 text-orange-500'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>สินค้า: {review.listing_title}</span>
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString('th-TH')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
