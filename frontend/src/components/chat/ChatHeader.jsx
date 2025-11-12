// components/chat/ChatHeader.jsx
import ChatAvatar from "./ChatAvatar";

const ChatHeader = ({ conversation, currentUserId }) => {
    console.log(conversation);
    
    // เช็คว่าเราคือผู้ซื้อหรือผู้ขาย
    const isBuyer = currentUserId === conversation.buyer_id;
    
    // เลือกข้อมูลของคนที่เราคุยด้วย
    const otherUser = {
        username: isBuyer ? conversation.seller_username : conversation.buyer_username,
        firstName: isBuyer ? conversation.seller_first_name : conversation.buyer_first_name,
        avatar: isBuyer ? conversation.seller_avatar : conversation.buyer_avatar
    };
    
    return (
        <div className="bg-white border-b p-4 flex items-center gap-3">
            <ChatAvatar username={otherUser.username} size="md" />
            <div>
                <p className="font-semibold text-gray-900">
                    {otherUser.firstName || otherUser.username}
                </p>
                <p className="text-xs text-gray-500">ติดต่อจาก {conversation.listing_title}</p>
            </div>
        </div>
    );
};

export default ChatHeader;