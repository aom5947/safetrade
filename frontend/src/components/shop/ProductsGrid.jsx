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

    let filteredListings = listings;
if (tabType === 'statusPending') {
    filteredListings = listings.filter(
        (item) => item.status === 'pending' || item.status === 'hidden'
    );
}



    if (filteredListings.length === 0) {
        return <EmptyState message="ไม่พบสินค้า" />;
    }

    console.log(listings);


    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
                <ListingCard key={listing.listing_id} listing={listing} tabType={tabType} />
            ))}
        </div>
    );
}
