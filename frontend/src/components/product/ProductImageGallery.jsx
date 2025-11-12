import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductImageGallery({ images = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                ไม่มีรูปภาพสินค้า
            </div>
        );
    }

    return (
        <div className="w-full relative z-0"> {/* ensure it doesn't create higher stacking */}
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                className="rounded-lg overflow-hidden text-gray-700 relative z-0" // z-0
            >
                {images.map((img, index) => (
                    <SwiperSlide key={index}>
                        <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full h-64 md:h-96 object-cover"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full z-10">
                {activeIndex + 1} / {images.length}
            </div>
        </div>
    );
}
