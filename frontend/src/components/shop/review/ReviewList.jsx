import React from 'react';
import { Star, Flag, Trash2, AlertCircle } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

const ReviewList = ({ sellerId, currentUserId, userRole }) => {
  const { 
    reviews, 
    loading, 
    error, 
    sellerRating, 
    deleteReview, 
    markSpam 
  } = useReviews(sellerId);

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('คุณต้องการลบรีวิวนี้ใช่หรือไม่?')) return;

    const result = await deleteReview(reviewId);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleMarkSpam = async (reviewId, isSpam) => {
    const result = await markSpam(reviewId, isSpam);
    if (!result.success) {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {sellerRating.average?.toFixed(1) || '0.0'}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(sellerRating.average)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {sellerRating.count || 0} รีวิว
            </p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-12">{rating} ดาว</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">ยังไม่มีรีวิว</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review.review_id}
              className={`bg-white border rounded-xl p-6 ${
                review.is_spam ? 'opacity-50 border-red-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.reviewer_first_name?.[0] || review.reviewer_username?.[0] || 'U'}
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {review.reviewer_first_name} {review.reviewer_last_name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        @{review.reviewer_username}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Listing Info */}
                    {review.listing_title && (
                      <p className="text-sm text-gray-600 mb-2">
                        สินค้า: <span className="font-medium">{review.listing_title}</span>
                      </p>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    )}

                    {/* Spam Badge */}
                    {review.is_spam && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                        <Flag className="w-3 h-3" />
                        ถูกทำเครื่องหมายว่าเป็นสแปม
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {/* Delete Button */}
                  {(currentUserId === review.reviewer_id || userRole === 'admin' || userRole === 'super_admin') && (
                    <button
                      onClick={() => handleDeleteReview(review.review_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบรีวิว"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Mark Spam */}
                  {(userRole === 'admin' || userRole === 'super_admin') && (
                    <button
                      onClick={() => handleMarkSpam(review.review_id, review.is_spam)}
                      className={`p-2 rounded-lg transition-colors ${
                        review.is_spam
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-orange-600 hover:bg-orange-50'
                      }`}
                      title={review.is_spam ? 'ยกเลิก' : 'ทำเครื่องหมายสแปม'}
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
