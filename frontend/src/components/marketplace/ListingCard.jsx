import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaRegClock, FaHeart } from "react-icons/fa";
import { Eye } from "lucide-react";
const ListingCard = ({ item, isSaved, onToggleFavorite, loading }) => {
  const navigate = useNavigate()

  const formatTimeAgo = (createdAt) => {
    if (!createdAt) {
      return "เมื่อเร็วๆ นี้";
    }

    const diff = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} วันที่แล้ว`;
    if (hours > 0) return `${hours} ชม.ที่แล้ว`;
    return "เมื่อสักครู่";
  };

  return (
    <div
      onClick={() => navigate(`/product/${item.listing_id}`, { state: { item } })}
      className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition cursor-pointer group"
    >
      {/* รูป */}
      <div className="relative h-40 rounded-t-xl overflow-hidden bg-gray-100">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex flex-col items-center justify-center text-gray-400"
          style={{ display: item.thumbnail ? 'none' : 'flex' }}
        >
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">ไม่มีรูปภาพ</span>
        </div>

        {/* ปุ่มบันทึก */}
        <button
          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
          onClick={(e) => onToggleFavorite(e, item.listing_id)}
          title={isSaved ? "บันทึกแล้ว" : "บันทึกประกาศ"}
          disabled={loading}
        >
          <FaHeart
            className={`transition-colors ${isSaved ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
              }`}
          />
        </button>

        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur px-2 py-1 rounded text-sm font-semibold">
          ฿ {Number(item.price).toLocaleString()}
        </div>

        <div className="absolute top-2 left-2 text-black backdrop-blur px-2 py-1 rounded text-sm font-semibold">
          <span className="flex items-center gap-1">
            <Eye />
            <span>
              {item.view_count}
            </span>
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
        <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-1">
          <FaMapMarkerAlt />
          <span className="truncate">{item.location || "ไม่ระบุ"}</span>
        </div>
        <div className="flex items-center justify-between text-[12px] text-gray-500 mt-1">
          <span></span>
          <span className="flex items-center gap-1">
            <FaRegClock />
            {formatTimeAgo(item.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;