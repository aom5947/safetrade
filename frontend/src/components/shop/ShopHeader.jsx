import React, { useState } from 'react';
import { Store, MessageCircle, Share2 } from 'lucide-react';
import {
    FacebookShareButton,
    TwitterShareButton,
    LineShareButton,
    FacebookMessengerShareButton,
    TelegramShareButton,
    FacebookIcon,
    TwitterIcon,
    LineIcon,
    FacebookMessengerIcon,
    TelegramIcon
} from 'react-share';

export default function ShopHeader({ seller, onChat }) {
    const [showShareMenu, setShowShareMenu] = useState(false);

    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    const shareUrl = `${baseUrl}/shop/${seller?.username}`;

    // ✅ ข้อความอัตโนมัติสำหรับแชร์
    const shareTitle = `${seller?.username} - ร้านค้าสุดพิเศษบน YourPlatform 🛍️`;
    const shareMessage = `แวะชมร้านของ ${seller?.username} ได้ที่นี่เลย 💬✨\n${shareUrl}\n#YourPlatform #ShoppingOnline`;

    // ✅ เผื่อในอนาคตถ้าคุณมีรูป OG
    const shareImage = seller?.avatar_url || "https://yourdomain.com/default-shop.jpg";

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
                {/* Profile Image */}
                <div className="mx-auto flex items-center lg:w-28 lg:h-28">
                    {seller?.avatar_url ? (
                        <img
                            src={seller.avatar_url}
                            alt={seller.username}
                            className="w-full h-full rounded-full object-cover aspect-square"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Store className="w-10 h-10" />
                        </div>
                    )}
                </div>

                {/* Shop Info */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {seller?.first_name}-{seller?.last_name}
                    </h1>
                    <div className="grid text-sm text-gray-600">
                        <span>username - @{seller.username}</span>
                        <span>สมาชิกเมื่อ - {new Date(seller?.created_at).toLocaleDateString('th-TH')}</span>
                        {seller?.listing_count !== undefined && (
                            <>
                                <span className=''>จํานวนสินค้าที่ลงขาย: <span className='text-blue-500'>{seller.listing_count} รายการ</span></span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>แชร์</span>
                        </button>

                        {/* Share Menu */}
                        {showShareMenu && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowShareMenu(false)}
                                />

                                {/* Share Options */}
                                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20 min-w-[200px]">
                                    <p className="text-sm font-medium text-gray-700 mb-3">แชร์ไปที่</p>
                                    <div className="flex gap-2">
                                        <FacebookShareButton
                                            url={shareUrl}
                                            quote={shareMessage}
                                            hashtag="#YourPlatform"
                                        >
                                            <FacebookIcon size={40} round />
                                        </FacebookShareButton>

                                        <TwitterShareButton
                                            url={shareUrl}
                                            title={shareMessage}
                                            hashtags={["YourPlatform", "ช้อปออนไลน์"]}
                                        >
                                            <TwitterIcon size={40} round />
                                        </TwitterShareButton>

                                        <LineShareButton
                                            url={shareUrl}
                                            title={shareMessage}
                                        >
                                            <LineIcon size={40} round />
                                        </LineShareButton>

                                        <FacebookMessengerShareButton
                                            url={shareUrl}
                                            appId="YOUR_APP_ID"
                                        >
                                            <FacebookMessengerIcon size={40} round />
                                        </FacebookMessengerShareButton>

                                        <TelegramShareButton
                                            url={shareUrl}
                                            title={shareMessage}
                                        >
                                            <TelegramIcon size={40} round />
                                        </TelegramShareButton>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
