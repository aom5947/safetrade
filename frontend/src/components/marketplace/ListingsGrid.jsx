import ListingCard from "./ListingCard";

const ListingsGrid = ({
    listings,
    loading,
    savedListings,
    loadingIds,
    onToggleFavorite,
    categorySelected,
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">ไม่พบประกาศที่ตรงกับการค้นหา</p>
                {!categorySelected && (
                    <p className="text-gray-400 text-sm mt-2">
                        กรุณาเลือกหมวดหมู่เพื่อดูประกาศ
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((item) => (
                <ListingCard
                    key={item.listing_id}
                    item={item}
                    isSaved={savedListings[item.listing_id] || false}
                    loading={loadingIds[item.listing_id] || false}
                    onToggleFavorite={onToggleFavorite}
                />
            ))}
        </div>
    );
};

export default ListingsGrid;