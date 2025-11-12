// components/chat/ConversationList.jsx
import { FaRegCommentDots, FaTimes } from "react-icons/fa";
import ConversationListItem from "./ConversationListItem";

const ConversationList = ({
    conversations,
    selectedConversation,
    loading,
    onSelectConversation,
    onClose,
    currentUserId  // เพิ่ม prop นี้
}) => {
    return (
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
                <h3 className="font-semibold text-white text-lg">💬 Messages</h3>
                <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-1.5 rounded-lg transition"
                >
                    <FaTimes size={18} />
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                        <FaRegCommentDots className="text-5xl mb-3" />
                        <p className="text-sm text-center">ยังไม่มีการสนทนา</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <ConversationListItem
                            key={conv.conversation_id}
                            conversation={conv}
                            isSelected={selectedConversation?.conversation_id === conv.conversation_id}
                            onClick={() => onSelectConversation(conv)}
                            currentUserId={currentUserId}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ConversationList;