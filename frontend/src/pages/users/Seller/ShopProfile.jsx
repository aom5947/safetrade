import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Store, Share2, MessageCircle, Star, Package, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { api } from '@/services/api';

export default function ShopProfile() {
    const { sellerId } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('products');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State สำหรับข้อมูลผู้ขาย
    const [seller, setSeller] = useState(null);

    // State สำหรับสินค้า
    const [listings, setListings] = useState([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // State สำหรับรีวิว
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({
        total_reviews: 0,
        average_rating: 0
    });
    const [reviewPagination, setReviewPagination] = useState({
        limit: 20,
        offset: 0,
        total: 0
    });

    // ✅ แก้ไข: ดึงข้อมูลโปรไฟล์ผู้ขาย
    useEffect(() => {
        const fetchSellerProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/sellers/${sellerId}`);

                // ✅ FIX: เข้าถึง response.data.data โดยตรง (ไม่มี .seller)
                if (response.data.success && response.data.data) {
                    setSeller(response.data.data);
                } else {
                    setError('ไม่พบข้อมูลผู้ขาย');
                }
            } catch (err) {
                console.error('Error fetching seller profile:', err);
                if (err.response?.status === 404) {
                    setError('ไม่พบผู้ขายที่คุณค้นหา');
                } else {
                    setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
                }
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) {
            fetchSellerProfile();
        }
    }, [sellerId]);

    // ✅ แก้ไข: ดึงข้อมูลสินค้าตาม tab ที่เลือก
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setListingsLoading(true);
                const status = activeTab === 'sold' ? 'sold' : 'active';

                const response = await api.get(`/sellers/${sellerId}/listings`, {
                    params: {
                        status,
                        page: pagination.page,
                        limit: pagination.limit,
                        q: searchQuery || undefined
                    }
                });

                // ✅ FIX: data เป็น array โดยตรง ไม่มี .listings
                if (response.data.success) {
                    setListings(response.data.data || []);

                    // ✅ FIX: pagination อยู่นอก data
                    if (response.data.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            total: response.data.pagination.total,
                            totalPages: response.data.pagination.totalPages
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching listings:', err);
                setListings([]);
            } finally {
                setListingsLoading(false);
            }
        };

        if (sellerId && activeTab !== 'reviews') {
            fetchListings();
        }
    }, [sellerId, activeTab, pagination.page, searchQuery]);

    // ✅ แก้ไข: ดึงข้อมูลรีวิว
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setListingsLoading(true);

                const response = await api.get(`/sellers/${sellerId}/reviews`, {
                    params: {
                        limit: reviewPagination.limit,
                        offset: reviewPagination.offset
                    }
                });

                // ✅ FIX: data เป็น array โดยตรง ไม่มี .reviews
                if (response.data.success) {
                    setReviews(response.data.data || []);

                    // ✅ FIX: ชื่อ field คือ "sellerRating" ไม่ใช่ "seller_rating" 
                    // และอยู่นอก data
                    if (response.data.sellerRating) {
                        setReviewStats({
                            // ✅ FIX: ชื่อ field คือ "average" และ "count"
                            average_rating: response.data.sellerRating.average || 0,
                            total_reviews: response.data.sellerRating.count || 0
                        });
                    }

                    // ✅ FIX: pagination อยู่นอก data
                    if (response.data.pagination) {
                        setReviewPagination(prev => ({
                            ...prev,
                            total: response.data.pagination.total
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setReviews([]);
            } finally {
                setListingsLoading(false);
            }
        };

        if (sellerId && activeTab === 'reviews') {
            fetchReviews();
        }
    }, [sellerId, activeTab, reviewPagination.offset, reviewPagination.limit]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handle chat button
    const handleChat = () => {
        navigate(`/messages/${sellerId}`);
    };

    // Handle share button
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: seller?.username || 'Shop Profile',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        }
    };

    // Handle review pagination
    const handleReviewPageChange = (direction) => {
        if (direction === 'next') {
            setReviewPagination(prev => ({
                ...prev,
                offset: prev.offset + prev.limit
            }));
        } else {
            setReviewPagination(prev => ({
                ...prev,
                offset: Math.max(0, prev.offset - prev.limit)
            }));
        }
    };

    // Calculate review pages
    const currentReviewPage = Math.floor(reviewPagination.offset / reviewPagination.limit) + 1;
    const totalReviewPages = Math.ceil(reviewPagination.total / reviewPagination.limit);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">กำลังโหลด...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !seller) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😞</div>
                        <p className="text-gray-600 text-lg mb-4">{error || 'ไม่พบข้อมูลผู้ขาย'}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-orange-500 text-white rounded-sm hover:bg-orange-600"
                        >
                            กลับหน้าแรก
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Shop Header */}
            <div className="bg-white border-b">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <div className="flex items-start gap-6">
                        {/* Shop Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                            {seller.avatar_url ? (
                                <img
                                    src={seller.avatar_url}
                                    alt={seller.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                                    <Store className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        {/* Shop Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                        {seller.username}
                                    </h1>
                                    <p className="text-gray-600 mb-3">
                                        {seller.first_name} {seller.last_name}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Package className="w-4 h-4" />
                                            <span>{seller.listing_count || 0} สินค้า</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleChat}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-sm hover:bg-orange-600"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        แชท
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 border border-gray-300 rounded-sm hover:bg-gray-50"
                                    >
                                        <Share2 className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-6 border-b mb-6">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'products'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        สินค้า
                    </button>
                    <button
                        onClick={() => setActiveTab('sold')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'sold'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        ขายแล้ว
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'reviews'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        รีวิว ({reviewStats.total_reviews})
                    </button>
                </div>

                {/* Search Bar (for products/sold tabs) */}
                {activeTab !== 'reviews' && (
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="ค้นหาในร้านนี้..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </form>
                )}

                {/* Content */}
                {listingsLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">กำลังโหลด...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Products & Sold Items Grid */}
                        {activeTab !== 'reviews' && (
                            <>
                                {listings.length === 0 ? (
                                    <EmptyState
                                        message={activeTab === 'sold'
                                            ? 'ยังไม่มีสินค้าที่ขายแล้ว'
                                            : 'ยังไม่มีสินค้าในร้าน'
                                        }
                                    />
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {listings.map(listing => (
                                            <ListingCard key={listing.listing_id} listing={listing} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <>
                                {/* Rating Summary */}
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <div className="flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-gray-900 mb-2">
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

                                {/* Review Pagination */}
                                {totalReviewPages > 1 && (
                                    <div className="flex justify-center mt-8 gap-2">
                                        <button
                                            onClick={() => handleReviewPageChange('prev')}
                                            disabled={reviewPagination.offset === 0}
                                            className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ก่อนหน้า
                                        </button>
                                        <span className="px-4 py-2 border border-gray-300 rounded-sm bg-white">
                                            {currentReviewPage} / {totalReviewPages}
                                        </span>
                                        <button
                                            onClick={() => handleReviewPageChange('next')}
                                            disabled={reviewPagination.offset + reviewPagination.limit >= reviewPagination.total}
                                            className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ถัดไป
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Listing Pagination */}
                        {activeTab !== 'reviews' && pagination.totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ก่อนหน้า
                                </button>
                                <span className="px-4 py-2 border border-gray-300 rounded-sm bg-white">
                                    {pagination.page} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ถัดไป
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="mb-6">
                <svg className="w-32 h-32 text-gray-300" viewBox="0 0 200 150" fill="none">
                    <rect x="40" y="50" width="120" height="80" fill="currentColor" opacity="0.3" />
                    <rect x="50" y="40" width="100" height="10" fill="currentColor" opacity="0.4" />
                    <path d="M50 40 L100 20 L150 40" stroke="currentColor" strokeWidth="3" opacity="0.4" />
                </svg>
            </div>
            <p className="text-gray-500 text-lg">{message}</p>
        </div>
    );
}

// Listing Card Component
function ListingCard({ listing }) {
    const navigate = useNavigate();
    const mainImage = listing.images?.[0]?.image_url || '/placeholder-image.jpg';

    return (
        <div
            onClick={() => navigate(`/product/${listing.listing_id}`)}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="aspect-square bg-gray-200">
                <img
                    src={mainImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {listing.title}
                </h3>
                <p className="text-lg font-bold text-orange-500">
                    ฿{listing.price.toLocaleString()}
                </p>
                {listing.status === 'sold' ? (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                        ขายแล้ว
                    </span>
                ) : (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                        ยังมีสินค้า
                    </span>
                )}
            </div>
        </div>
    );
}

// Review Card Component
function ReviewCard({ review }) {
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