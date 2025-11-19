import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ListingCard({ listing, tabType }) {
    const navigate = useNavigate();
    const mainImage = listing.images?.[0]?.image_url || '/placeholder-image.jpg';

    const renderStatusBadge = () => {

        console.log(listing.status);

        if (tabType === 'statusPending') {
            if (listing.status === 'hidden') {
                return (
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-400 text-gray-800 text-xs rounded">
                        ถูกซ่อนอยู่
                    </span>
                );
            }
            if (listing.status === 'pending') {
                return (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-400 text-gray-100 text-xs rounded">
                        รออนุมัติ
                    </span>
                );
            }
            if (listing.status === 'rejected') {
                return (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-400 text-gray-100 text-xs rounded">
                        ปฏิเสธโดยแอดมิน
                    </span>
                );
            }
        }

        // แท็บอื่น
        if (listing.status === 'sold') {
            return (
                <span className="inline-block mt-2 px-2 py-1 bg-red-400 text-gray-100 text-xs rounded">
                    ขายแล้ว
                </span>
            );
        }

        if (listing.status === 'hidden') {
            return (
                <span className="inline-block mt-2 px-2 py-1 bg-gray-400 text-gray-100 text-xs rounded">
                    ซ่อนอยู่
                </span>
            );
        }

        return (
            <span className="inline-block mt-2 px-2 py-1 bg-green-400 text-gray-100 text-xs rounded">
                ยังมีสินค้า
            </span>
        );
    };

    return (
        <div
            onClick={() => navigate(`/product/${listing.listing_id}`)}
            className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
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
                <p className="text-lg font-bold text-blue-500">
                    ฿ {listing.price.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })}
                </p>

                {renderStatusBadge()}
            </div>
        </div>
    );
}
