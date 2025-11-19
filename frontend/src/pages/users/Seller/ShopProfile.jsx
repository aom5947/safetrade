import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ShopHeader from '@/components/shop/ShopHeader';
import ShopTabs from '@/components/shop/ShopTabs';
import SearchBar from '@/components/shop/SearchBar';
import ProductsGrid from '@/components/shop/ProductsGrid';
import ReviewsList from '@/components/shop/ReviewsList';
import Pagination from '@/components/shop/Pagination';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import { useSellerListings } from '@/hooks/useSellerListings';
import { useSellerReviews } from '@/hooks/useSellerReviews';

export default function ShopProfile() {
    const { sellerId } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('products');
    const [searchQuery, setSearchQuery] = useState('');

    // Custom hooks
    const { seller, loading, error } = useSellerProfile(sellerId);
    const {
        listings,
        loading: listingsLoading,
        pagination,
        setPage,
        resetPage
    } = useSellerListings(sellerId, activeTab, searchQuery);
    const {
        reviews,
        loading: reviewsLoading,
        reviewStats,
        pagination: reviewPagination,
        handlePageChange: handleReviewPageChange,
        currentPage: currentReviewPage,
        totalPages: totalReviewPages
    } = useSellerReviews(sellerId, activeTab);

    const role = localStorage.getItem('user_role');

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        resetPage();
    };

    // Handle chat button
    const handleChat = () => {
        navigate(`/messages/${sellerId}`);
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar role={role} />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar role={role} />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="text-red-500 text-xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            เกิดข้อผิดพลาด
                        </h2>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }
    

    // const filteredListings =
    //     activeTab === 'statusPending'
    //         ? listings.filter(item => item.status === 'pending' || item.status === 'hidden' || item.status === 'rejected')
    //         : listings;


    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar role={role} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Shop Header */}
                <ShopHeader seller={seller} onChat={handleChat} />

                {/* Tabs */}
                <ShopTabs activeTab={activeTab} onTabChange={handleTabChange} role={role} />

                {/* Search Bar (ไม่ต้องใช้ใน reviews tab) */}
                {activeTab !== 'reviews' && (
                    <SearchBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSearchSubmit={handleSearch}
                    />
                )}

                {/* Content */}
                {activeTab === 'reviews' ? (
                    <>
                        <ReviewsList
                            reviews={reviews}
                            reviewStats={reviewStats}
                            loading={reviewsLoading}
                        />
                        <Pagination
                            currentPage={currentReviewPage}
                            totalPages={totalReviewPages}
                            onPageChange={(page) => {
                                const direction = page > currentReviewPage ? 'next' : 'prev';
                                handleReviewPageChange(direction);
                            }}
                            disabled={reviewsLoading}
                        />
                    </>
                ) : (
                    <>
                        <ProductsGrid listings={listings} loading={listingsLoading} tabType={activeTab} />

                        {/* Pagination */}
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            disabled={listingsLoading}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
