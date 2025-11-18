import React from 'react';
import { Star, ThumbsUp, AlertCircle } from 'lucide-react';
import { useCreateReview } from '@/hooks/useCreateReview';
// import { toast } from 'sonner';

const CreateReviewForm = ({ listingId, onReviewCreated }) => {
  const {
    rating,
    setRating,
    hoverRating,
    setHoverRating,
    comment,
    setComment,
    loading,
    error,
    hasReviewed,
    existingReview,
    submitReview
  } = useCreateReview(listingId);

  const handleSubmit = async () => {
    const result = await submitReview();
    if (result.success && onReviewCreated) {
      onReviewCreated();
    }
  };

  if (hasReviewed && existingReview) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <ThumbsUp className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h4 className="font-semibold text-green-900 mb-2">คุณได้ให้รีวิวแล้ว</h4>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < existingReview.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            {existingReview.comment && (
              <p className="text-gray-700 mt-2">{existingReview.comment}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              ให้รีวิวเมื่อ {new Date(existingReview.created_at).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">เขียนรีวิว</h3>

      <div className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ให้คะแนน <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                    }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 5 && 'ยอดเยี่ยมมาก!'}
              {rating === 4 && 'ดีมาก'}
              {rating === 3 && 'ดี'}
              {rating === 2 && 'พอใช้'}
              {rating === 1 && 'ต้องปรับปรุง'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ความคิดเห็น (ไม่บังคับ)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="แบ่งปันประสบการณ์ของคุณ..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/1000 ตัวอักษร
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <>
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              กำลังส่งรีวิว...
            </>
          ) : (
            <>
              <Star className="w-5 h-5" />
              ส่งรีวิว
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateReviewForm;
