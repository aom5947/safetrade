import React, { useState } from 'react';
import ReviewList from './ReviewList';
import CreateReviewForm from './CreateReviewForm';

const ProductReviewSection = ({ product, currentUserId, userRole }) => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewCreated = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('reviews');
  };

  // Don't show create review tab for seller's own product
  const showCreateTab = currentUserId !== product.seller_id;

  return (
    <div className="rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">รีวิวและความคิดเห็น</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'reviews'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          รีวิวทั้งหมด
          {activeTab === 'reviews' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        {showCreateTab && (
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === 'create'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            เขียนรีวิว
            {activeTab === 'create' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'reviews' && (
          <ReviewList 
            key={refreshKey}
            sellerId={product.seller_id}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        )}
        {activeTab === 'create' && showCreateTab && (
          <CreateReviewForm
            listingId={product.listing_id}
            onReviewCreated={handleReviewCreated}
          />
        )}
      </div>
    </div>
  );
};

export default ProductReviewSection;
