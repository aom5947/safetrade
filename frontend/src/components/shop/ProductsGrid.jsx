import React from 'react';
import ListingCard from './ListingCard';
import EmptyState from './EmptyState';

export default function ProductsGrid({ listings, loading, tabType }) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // ลบการ filter ออก ใช้ listings โดยตรง
    if (listings.length === 0) {
        return <EmptyState message="ไม่พบสินค้า" />;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
                <ListingCard key={listing.listing_id} listing={listing} tabType={tabType} />
            ))}
        </div>
    );
}
