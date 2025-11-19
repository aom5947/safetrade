import React, { useState, useEffect } from 'react';
import { Star, Search, X, MessageSquare, Flag, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/Admin_components/ui/card';
import { Button } from '@/components/Admin_components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Admin_components/ui/table';
import { EmptyState } from '@/components/Admin_components/EmptyState';
import { api } from '@/services/api';


const Loading = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Modal Component สำหรับแสดงคอมเมนต์เต็ม
const CommentModal = ({ isOpen, onClose, review }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold">ความคิดเห็นรีวิว</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Review Info */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">ผู้รีวิว:</span>
                <p className="font-medium">
                  {review.reviewer_first_name} {review.reviewer_last_name}
                </p>
              </div>
              {review.seller_first_name && (
                <div>
                  <span className="text-gray-500">ผู้ถูกรีวิว:</span>
                  <p className="font-medium">
                    {review.seller_first_name} {review.seller_last_name}
                  </p>
                </div>
              )}
              {review.listing_title && (
                <div>
                  <span className="text-gray-500">สินค้า:</span>
                  <p className="font-medium">{review.listing_title}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">คะแนน:</span>
                <p className="font-medium">⭐ {review.rating}/5</p>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ความคิดเห็น:
            </label>
            <div className="bg-white border border-gray-200 rounded-lg p-4 whitespace-pre-wrap">
              {review.comment || (
                <span className="text-gray-400 italic">ไม่มีความคิดเห็น</span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              ปิด
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listingId, setListingId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews/admin/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
        },
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        setReviews(response.data.data || []);
        setStatistics(response.data.statistics || null);
        toast.success(response.data.message);
      } else {
        toast.error('ไม่สามารถดึงข้อมูลได้');
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลรีวิวทั้งหมดได้');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsByListing = async (id) => {
    if (!id || id.trim() === '') {
      toast.error('กรุณาระบุ Listing ID');
      return;
    }

    try {
      setLoading(true);

      console.log('🔍 Searching for listing ID:', id);

      // เปลี่ยน API endpoint
      const response = await api.get(`/reviews/listing/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
        },
      });

      console.log('✅ Response:', response.data);

      if (response.data.success) {
        const reviewsData = response.data.data || [];
        console.log('📊 Reviews found:', reviewsData.length);

        setReviews(reviewsData);
        setStatistics(null); // API ใหม่ไม่มี statistics
        setListingId(id);

        if (reviewsData.length === 0) {
          toast.info(`ไม่พบรีวิวสำหรับสินค้า ID: ${id}`);
        } else {
          toast.success(`พบ ${reviewsData.length} รีวิวสำหรับสินค้า ID: ${id}`);
        }
      } else {
        console.warn('⚠️ API returned success: false');
        toast.error(response.data.message || 'ไม่สามารถดึงข้อมูลได้');
        setReviews([]);
      }
    } catch (error) {
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });

      if (error.response?.status === 404) {
        toast.error(`ไม่พบสินค้า ID: ${id}`);
      } else if (error.response?.status === 401) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
      } else {
        toast.error(error.response?.data?.message || 'ไม่สามารถโหลดรีวิวของสินค้าได้');
      }
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchReviewsByListing(searchInput.trim());
    }
  };

  const handleClearFilter = () => {
    setListingId('');
    setSearchInput('');
    fetchReviews();
  };

  const handleToggleSpam = async (reviewId, currentSpamStatus) => {
    const newSpamStatus = !currentSpamStatus;
    const action = newSpamStatus ? 'ทำเครื่องหมายเป็นสแปม' : 'ยกเลิกการทำเครื่องหมายสแปม';

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะ${action}?`)) return;

    try {
      const response = await api.patch(
        `/reviews/${reviewId}/spam`,
        { isSpam: newSpamStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(`${action}สำเร็จ`);

        // Refresh reviews
        if (listingId) {
          fetchReviewsByListing(listingId);
        } else {
          fetchReviews();
        }
      } else {
        toast.error('ไม่สามารถอัพเดทสถานะได้');
      }
    } catch (error) {
      console.error('Error toggling spam:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถอัพเดทสถานะสแปมได้');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) return;

    try {
      const response = await api.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success('ลบรีวิวสำเร็จ');

        // Refresh reviews
        if (listingId) {
          fetchReviewsByListing(listingId);
        } else {
          fetchReviews();
        }
      } else {
        toast.error('ไม่สามารถลบรีวิวได้');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถลบรีวิวได้');
    }
  };

  const handleViewComment = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
              }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // ตรวจสอบว่าเป็นข้อมูลแบบเต็ม (จาก /admin/all) หรือแบบย่อ (จาก /listing/:id)
  const isFullData = reviews.length > 0 && reviews[0].seller_username;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการรีวิว</h1>
        <p className="text-gray-500 mt-1">ดูและจัดการรีวิวจากผู้ใช้งาน</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">รีวิวทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">{statistics.totalReviews}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">คะแนนเฉลี่ย</p>
                <p className="text-3xl font-bold text-yellow-500">{statistics.averageRating?.toFixed(2) || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">รีวิวที่เป็นสแปม</p>
                <p className="text-3xl font-bold text-red-600">{statistics.spamReviews}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">ผู้ขายที่ถูกรีวิว</p>
                <p className="text-3xl font-bold text-green-600">{statistics.totalSellersReviewed}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ค้นหารีวิวด้วย Listing ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <Button type="submit" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              ค้นหา
            </Button>
            {listingId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilter}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                แสดงทั้งหมด
              </Button>
            )}
          </form>

          {listingId && (
            <div className="mt-3 text-sm text-gray-600">
              กำลังแสดงรีวิวของสินค้า ID: <span className="font-semibold">{listingId}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <Loading />
          ) : !Array.isArray(reviews) || reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title={listingId ? "ไม่มีรีวิวสำหรับสินค้านี้" : "ไม่มีรีวิว"}
              description={listingId ? "ลองค้นหาสินค้าอื่น" : "ยังไม่มีรีวิวในระบบ"}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ผู้รีวิว</TableHead>
                    {isFullData && <TableHead>ผู้ถูกรีวิว</TableHead>}
                    {isFullData && <TableHead>สินค้า</TableHead>}
                    <TableHead>คะแนน</TableHead>
                    <TableHead>ความคิดเห็น</TableHead>
                    {isFullData && <TableHead>สถานะ</TableHead>}
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.review_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {review.reviewer_avatar && (
                            <img
                              src={review.reviewer_avatar}
                              alt={review.reviewer_username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">
                              {review.reviewer_first_name} {review.reviewer_last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{review.reviewer_username}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {isFullData && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {review.seller_avatar && (
                              <img
                                src={review.seller_avatar}
                                alt={review.seller_username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">
                                {review.seller_first_name} {review.seller_last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                @{review.seller_username}
                              </div>
                              <div className="text-xs text-yellow-600">
                                ⭐ {parseFloat(review.seller_rating_average).toFixed(1)} ({review.seller_rating_count})
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}

                      {isFullData && (
                        <TableCell>
                          <div>
                            <div className="font-medium max-w-xs truncate" title={review.listing_title}>
                              {review.listing_title}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {review.listing_id}
                            </div>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded mt-1 ${review.listing_status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                              }`}>
                              {review.listing_status}
                            </span>
                          </div>
                        </TableCell>
                      )}

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-500">
                            {review.rating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {review.comment ? (
                          <div>
                            <div className="text-sm" title={review.comment}>
                              {truncateText(review.comment, 60)}
                            </div>
                            {review.comment.length > 60 && (
                              <button
                                onClick={() => handleViewComment(review)}
                                className="text-blue-600 hover:text-blue-700 text-xs mt-1 flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                ดูเพิ่มเติม
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">ไม่มีความคิดเห็น</span>
                        )}
                      </TableCell>

                      {isFullData && (
                        <TableCell>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${review.is_spam
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                            }`}>
                            {review.is_spam ? 'สแปม' : 'ปกติ'}
                          </span>
                        </TableCell>
                      )}

                      <TableCell className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {isFullData && (
                            <Button
                              size="sm"
                              variant={review.is_spam ? "outline" : "secondary"}
                              onClick={() => handleToggleSpam(review.review_id, review.is_spam)}
                              className="flex items-center gap-1"
                              title={review.is_spam ? "ยกเลิกสแปม" : "ทำเครื่องหมายเป็นสแปม"}
                            >
                              {review.is_spam ? (
                                <ShieldAlert className="w-4 h-4" />
                              ) : (
                                <Flag className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(review.review_id)}
                          >
                            ลบ
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Summary */}
              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                แสดง {reviews.length} รีวิว
                {listingId && ` สำหรับสินค้า ID: ${listingId}`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={selectedReview}
      />
    </div>
  );
};

export default ReviewsPage;