import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

function ListingCard({ listing, index, onClick }) {
  return (
    <div
      className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition overflow-hidden cursor-pointer"
      onClick={onClick}
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      {/* Image Section */}
      <div className="relative h-40 bg-gray-100">
        <img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover"
        />
        
        {/* Badge (NEW/SALE etc.) */}
        {listing.badge && (
          <span
            className={`absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full text-white ${
              listing.badge === "NEW" ? "bg-rose-500" : "bg-orange-500"
            }`}
          >
            {listing.badge}
          </span>
        )}
        
        {/* Price Tag */}
        <div className="absolute bottom-2 left-2 bg-white/95 px-2 py-0.5 rounded text-sm font-semibold">
          ฿ {Number(listing.price).toLocaleString()}
        </div>
      </div>

      {/* Details Section */}
      <div className="p-3">
        <p className="font-semibold text-sm line-clamp-1">{listing.name}</p>
        <p className="text-xs text-gray-500 mt-1">{listing.location}</p>
      </div>
    </div>
  );
}

// skeleton loading state
function LoadingSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border shadow-sm p-4 animate-pulse h-56"
        />
      ))}
    </>
  );
}

/**
 * Latest Listings Section component
 * แสดงประกาศล่าสุดในรูปแบบ grid
 * 
 * @param {Array} listings - array ของประกาศล่าสุด
 * @param {boolean} isLoading - สถานะการโหลดข้อมูล
 * @param {Error} error - error object ถ้ามี
 */
function LatestListingsSection({ listings, isLoading, error }) {
  const navigate = useNavigate();

  console.log(listings);
  

  const handleViewAllClick = () => {
    navigate("/marketplace");
  };

  const handleListingClick = () => {
    // เมื่อคลิกที่ listing จะไปหน้า marketplace
    navigate("/marketplace");
  };

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" data-aos="fade-right">
            ประกาศล่าสุด
          </h3>
          <button
            onClick={handleViewAllClick}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด <FiChevronRight />
          </button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            <LoadingSkeleton count={4} />
          ) : error ? (
            <div className="col-span-full text-red-600">
              ไม่สามารถดึงประกาศล่าสุดได้
            </div>
          ) : listings.length === 0 ? (
            <div className="col-span-full text-gray-500">
              ยังไม่มีประกาศล่าสุด
            </div>
          ) : (
            listings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                index={index}
                onClick={handleListingClick}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default LatestListingsSection;
