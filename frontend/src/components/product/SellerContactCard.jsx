import {
    getPhoneLink,
    formatPhoneNumber,
    hasContactInfo,
} from "@/utils/contactUtils";
import ReportDropdown from "../report-dropdown";
import { Link } from "react-router-dom";
import { FaRegCommentDots } from "react-icons/fa";
import { api } from "@/services/api";
import { useChat } from "@/hooks/useChat";
import ChatModal from "../chat/ChatModal";
import { useState } from "react";

export default function SellerContactCard({ product, copyToClipboard, copied }) {
    // ข้อมูลผู้ขายที่จะแสดงในการ์ด
    const contactInfo = {
        phone: product.seller_phone || "—",
        location: product.location || "—",
        sellerName: product.seller_first_name || product.seller_username || "ผู้ขาย",
        sellerUsername: product.seller_username || "—",
        sellerRating: product.seller_rating || 0,
    };

    const token = localStorage.getItem("token");
    const userRole = "buyer";

    // ใช้ hook สำหรับจัดการแชท
    const {
        showChat,
        setShowChat,
        conversations,
        selectedConversation,
        messages,
        input,
        setInput,
        unreadCount,
        loading,
        currentUserId,
        handleChatClick,
        handleConversationSelect,
        sendMessage,
        fetchConversations, // ใช้สำหรับ refresh ข้อมูล
    } = useChat(userRole);

    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    // ฟังก์ชันสำหรับสร้างหรือเปิดแชทกับผู้ขาย
    const handleCreateOrOpenChat = async () => {
        // ป้องกันการกดซ้ำ
        if (isCreatingConversation) {
            return;
        }

        setIsCreatingConversation(true);

        try {
            // ขั้นตอนที่ 1: ดึงรายการแชททั้งหมดของผู้ใช้
            const conversationsResponse = await api.get(
                "https://testmybackendpower.onrender.com/api/v1/conversations",
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    },
                }
            );

            const allConversations = conversationsResponse.data?.data || [];
            console.log("📋 รายการแชททั้งหมด:", allConversations);

            // ขั้นตอนที่ 2: ตรวจสอบว่ามีแชทกับสินค้านี้อยู่แล้วหรือไม่
            const existingConversation = allConversations.find(
                (conversation) => {
                    return conversation.listing_id === product.listing_id;
                }
            );

            // ถ้าพบแชทที่มีอยู่แล้ว
            if (existingConversation) {
                console.log("🟢 พบแชทที่มีอยู่แล้ว:", existingConversation);
                
                // รอให้ fetchConversations ทำงานเสร็จก่อน
                await fetchConversations();
                
                // เปิด modal แชทโดยไม่ต้องสร้างใหม่
                setShowChat(true);
                
                // เลือก conversation ที่พบ พร้อมโหลดข้อความ
                handleConversationSelect(existingConversation);
                return;
            }

            // ขั้นตอนที่ 3: ถ้าไม่พบแชท ให้สร้างแชทใหม่
            console.log("🔵 กำลังสร้างแชทใหม่สำหรับ listing_id:", product.listing_id);
            
            const createConversationResponse = await api.post(
                "http://localhost:3000/api/v1/conversations",
                { 
                    listingId: product.listing_id 
                },
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    },
                }
            );

            console.log("🆕 สร้างแชทใหม่สำเร็จ:", createConversationResponse.data);

            // ขั้นตอนที่ 4: ดึงข้อมูล conversations ทั้งหมดอีกครั้ง
            // เพื่อให้ได้ข้อมูลครบถ้วน (listing_title, thumbnail, ฯลฯ)
            const updatedConversationsResponse = await api.get(
                "http://localhost:3000/api/v1/conversations",
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    },
                }
            );

            const updatedConversations = updatedConversationsResponse.data?.data || [];
            console.log("🔄 ข้อมูลแชทที่อัพเดทแล้ว:", updatedConversations);
            
            // หา conversation ที่เพิ่งสร้าง
            const newlyCreatedConversation = updatedConversations.find(
                (conversation) => {
                    return conversation.listing_id === product.listing_id;
                }
            );

            // ขั้นตอนที่ 5: เปิด modal และเลือก conversation
            if (newlyCreatedConversation) {
                console.log("✅ พบข้อมูลแชทที่สร้างใหม่:", newlyCreatedConversation);
                
                // รอให้ fetchConversations ทำงานเสร็จก่อน เพื่อ refresh ข้อมูลใน hook
                await fetchConversations();
                
                // เปิด modal แชท
                setShowChat(true);
                
                // เลือก conversation พร้อมโหลดข้อความ
                handleConversationSelect(newlyCreatedConversation);
                
                alert("✅ สร้างแชทสำเร็จ!");
            } else {
                // กรณีที่ไม่พบข้อมูล (ไม่น่าจะเกิด)
                console.warn("⚠️ ไม่พบข้อมูลแชทที่เพิ่งสร้าง");
                
                // ลองใช้ข้อมูลจาก response ตอน create
                setShowChat(true);
                
                // สร้าง conversation object พื้นฐาน
                const basicConversation = {
                    conversation_id: createConversationResponse.data?.data?.conversation_id,
                    listing_id: product.listing_id,
                    listing_title: product.title || "สินค้า",
                    listing_price: product.price || "0",
                    listing_thumbnail: product.thumbnail_url || "",
                };
                
                handleConversationSelect(basicConversation);
                alert("✅ สร้างแชทสำเร็จ!");
            }

        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการสร้างหรือเปิดแชท:", error);
            
            // แสดงข้อความ error ที่ชัดเจน
            if (error.response) {
                alert(`❌ ไม่สามารถสร้างแชทได้: ${error.response.data?.message || "เกิดข้อผิดพลาด"}`);
            } else {
                alert("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            }
        } finally {
            setIsCreatingConversation(false);
        }
    };

    // ตรวจสอบว่าผู้ขายมีข้อมูลติดต่อหรือไม่
    const hasSellerContactInfo = hasContactInfo(contactInfo);
    
    // ตรวจสอบว่ามีเบอร์โทรศัพท์หรือไม่
    const hasPhoneNumber = contactInfo.phone !== "—";
    
    // ตรวจสอบว่าเป็นผู้ซื้อหรือผู้ขาย
    const canUseChat = userRole === "buyer" || userRole === "seller";

    return (
        <div className="bg-white rounded-xl shadow p-6 h-fit sticky top-6">
            {/* ส่วนแสดงข้อมูลผู้ขาย */}
            <Link to={`/shop/${product.seller_id}`}>
                <div className="flex items-center gap-3">
                    {/* รูปโปรไฟล์แบบ Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                        {contactInfo.sellerName.charAt(0).toUpperCase()}
                    </div>
                    
                
                   {/* ข้อมูลผู้ขาย */}
                        <div>
                        <p>ลงขายโดย</p>
                        <p className="font-semibold">
                            {contactInfo.sellerName}-{product.seller_last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                            @{contactInfo.sellerUsername}

                            {/* ⭐ แสดงเรตติ้งแบบปลอดภัย */}
                            {parseFloat(contactInfo.sellerRating) > 0 && (
                                <span className="ml-2">
                                    ⭐ {parseFloat(contactInfo.sellerRating).toFixed(1)}
                                </span>
                            )}
                        </p>
                    </div>

                </div>
            </Link>

            <div className="mt-4 space-y-2">
                {/* กรณีที่ไม่มีข้อมูลติดต่อ */}
                {hasSellerContactInfo === false && (
                    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
                        <p className="font-semibold mb-1">
                            ⚠️ ข้อมูลการติดต่อยังไม่พร้อม
                        </p>
                        <p className="text-xs">
                            ข้อมูลการติดต่อยังไม่มีในระบบ
                        </p>
                    </div>
                )}

                {/* กรณีที่มีข้อมูลติดต่อ */}
                {hasSellerContactInfo === true && (
                    <>
                        {hasPhoneNumber === true && (
                            <>
                                <h3>ติดต่อผู้ขาย</h3>
                                
                                {/* แสดงเบอร์โทรศัพท์ */}
                                <ContactItem
                                    label="เบอร์โทร"
                                    value={formatPhoneNumber(contactInfo.phone)}
                                    copyValue={contactInfo.phone}
                                    copyToClipboard={copyToClipboard}
                                />

                                {/* ปุ่มเปิดแชท */}
                                {canUseChat === true && (
                                    <div className="flex items-center justify-between border rounded-lg p-3">
                                        <p className="text-xs text-gray-500">แชท</p>
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                            <button
                                                onClick={handleCreateOrOpenChat}
                                                disabled={isCreatingConversation}
                                                className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group disabled:opacity-50"
                                            >
                                                {isCreatingConversation === true ? (
                                                    <span className="text-xs">กำลังโหลด...</span>
                                                ) : (
                                                    <FaRegCommentDots className="text-xl text-gray-600 group-hover:text-blue-600 transition-colors" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Modal สำหรับแชท */}
                                <ChatModal
                                    isOpen={showChat}
                                    conversations={conversations}
                                    selectedConversation={selectedConversation}
                                    messages={messages}
                                    input={input}
                                    loading={loading}
                                    currentUserId={currentUserId}
                                    onClose={() => setShowChat(false)}
                                    onSelectConversation={handleConversationSelect}
                                    onInputChange={setInput}
                                    onSendMessage={sendMessage}
                                />
                            </>
                        )}
                    </>
                )}

                {/* ส่วนรายงานประกาศไม่เหมาะสม */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">
                        แจ้งประกาศไม่เหมาะสม
                    </h2>
                    <ReportDropdown
                        reportedType="listing"
                        reportedId={product.listing_id}
                        onSuccess={() => {
                            console.log("ส่งรายงานสำเร็จ");
                        }}
                        onError={(error) => {
                            console.error("เกิดข้อผิดพลาดในการส่งรายงาน:", error);
                        }}
                    />
                </div>

                {/* คำเตือนด้านความปลอดภัย */}
                <div className="border-t pt-4 text-xs text-gray-500 space-y-2">
                    <p>
                        🔒 เพื่อความปลอดภัย หลีกเลี่ยงการส่งข้อมูลส่วนตัวจนกว่าจะมั่นใจ
                    </p>
                    <p>
                        ⚠️ อย่าโอนมัดจำก่อนตรวจของจริง
                    </p>
                </div>
            </div>
        </div>
    );
}

// Component สำหรับแสดงข้อมูลติดต่อแต่ละรายการ
function ContactItem({ label, value, copyValue, copyToClipboard }) {
    const handleCopyClick = () => {
        copyToClipboard(copyValue, label);
    };

    return (
        <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <div className="flex items-center justify-between gap-2 mt-1">
                <span className="font-semibold break-all">{value}</span>
                <button
                    onClick={handleCopyClick}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                    คัดลอก
                </button>
            </div>
        </div>
    );
}