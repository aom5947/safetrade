// components/chat/ConversationListItem.jsx
import ChatAvatar from "./ChatAvatar";

const ConversationListItem = ({ conversation, isSelected, onClick, currentUserId }) => {
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
        <button
            onClick={onClick}
            className={`w-full p-4 border-b hover:bg-gray-50 transition text-left ${
                isSelected ? "bg-blue-50" : ""
            }`}
        >
            <div className="flex items-start gap-3">
                <ChatAvatar username={otherUser.username} size="lg" />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                            {otherUser.firstName || otherUser.username}
                        </p>
                        {conversation.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                                {conversation.unread_count}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">
                        {conversation.listing_title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message || "ยังไม่มีข้อความ"}
                    </p>
                </div>
            </div>
        </button>
    );
};

export default ConversationListItem;