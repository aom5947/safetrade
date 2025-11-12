// components/chat/ChatAvatar.jsx
const ChatAvatar = ({ username, size = "md", isMe = false }) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-12 h-12 text-lg"
    };

    const colorClass = isMe
        ? "bg-gradient-to-br from-green-500 to-green-600"
        : "bg-gradient-to-br from-blue-500 to-blue-600";

    const initial = username?.charAt(0).toUpperCase() || "U";

    return (
        <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
            {initial}
        </div>
    );
};

export default ChatAvatar;

// components/chat/ChatHeader.jsx
import ChatAvatar from "./ChatAvatar";

const ChatHeader = ({ conversation }) => {
    console.log(conversation);
        
    // เช็ค role

    return (
        <div className="bg-white border-b p-4 flex items-center gap-3">
            <ChatAvatar username={conversation.other_user_username} size="md" />
            <div>
                <p className="font-semibold text-gray-900">
                    ชื่อผู้ขาย {conversation.seller_username}
                </p>
                <p className="text-xs text-gray-500">ติดต่อจาก {conversation.listing_title}</p>
            </div>
        </div>
    );
};

export default ChatHeader;

// components/chat/ChatInput.jsx
const ChatInput = ({ value, onChange, onSend, disabled = false }) => {
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !disabled) {
            onSend();
        }
    };

    return (
        <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                    onClick={onSend}
                    disabled={disabled || !value.trim()}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                    ส่ง
                </button>
            </div>
        </div>
    );
};

export default ChatInput;

const ChatMessage = ({ message, isMe }) => {

    return (
        <div className="w-full">
            <div
                className={`px-4 py-2 rounded-2xl shadow-sm ${isMe
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md"
                    }`}
            >
                <p className="text-sm break-words">{message.message_text}</p>
            </div>

            <p
                className={`text-xs mt-0.5 px-3 ${isMe ? "text-gray-500 text-right" : "text-gray-400 text-left"
                    }`}
            >
                {new Date(message.sent_at).toLocaleTimeString("th-TH", {
                    timeZone: "Asia/Bangkok",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </p>
        </div>
    );
};

export default ChatMessage;
// components/chat/ChatMessageGroup.jsx
import ChatAvatar from "./ChatAvatar";
import ChatMessage from "./ChatMessage";

const ChatMessageGroup = ({ group }) => {
    
    return (
        <div className={`flex gap-2 ${group.isMe ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <ChatAvatar username={group.username} size="sm" isMe={group.isMe} />
            {/* Messages Group */}
            <div className={`flex flex-col gap-1 max-w-[70%] ${group.isMe ? "items-end" : "items-start"}`}>
                {/* Sender Name */}
                <span className={`text-xs font-medium px-3 ${group.isMe ? "text-gray-600" : "text-gray-700"
                    }`}>
                    {group.username}
                </span>

                {/* Messages */}
                {group.messages.map((msg) => (
                    <ChatMessage key={msg.message_id} message={msg} isMe={group.isMe} />
                ))}
            </div>
        </div>
    );
};

export default ChatMessageGroup;
// components/chat/ChatModal.jsx
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

const ChatModal = ({
    isOpen,
    conversations,
    selectedConversation,
    messages,
    input,
    loading,
    currentUserId,
    onClose,
    onSelectConversation,
    onInputChange,
    onSendMessage
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden">
                {/* Conversations List */}
                <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    loading={loading}
                    onSelectConversation={onSelectConversation}
                    onClose={onClose}
                />

                {/* Chat Window */}
                <div className="flex-1 flex flex-col">
                    <ChatWindow
                        selectedConversation={selectedConversation}
                        messages={messages}
                        input={input}
                        setInput={onInputChange}
                        onSendMessage={onSendMessage}
                        currentUserId={currentUserId}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
// components/chat/ChatWindow.jsx
import { FaRegCommentDots } from "react-icons/fa";
import ChatHeader from "./ChatHeader";
import ChatMessageGroup from "./ChatMessageGroup";
import ChatInput from "./ChatInput";
import useChatMessages from "@/hooks/useChatMessages";

const ChatWindow = ({
    selectedConversation,
    messages,
    input,
    setInput,
    onSendMessage,
    currentUserId
}) => {
    const groupedMessages = useChatMessages(messages, currentUserId, selectedConversation);

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <FaRegCommentDots className="text-6xl mx-auto mb-3 opacity-50" />
                    <p>เลือกการสนทนาเพื่อเริ่มแชท</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Chat Header */}
            <ChatHeader conversation={selectedConversation} />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {groupedMessages.map((group, index) => (
                    <ChatMessageGroup key={index} group={group} />
                ))}
            </div>

            {/* Input */}
            <ChatInput
                value={input}
                onChange={setInput}
                onSend={onSendMessage}
            />
        </>
    );
};

export default ChatWindow;

// components/chat/ConversationList.jsx
import { FaRegCommentDots, FaTimes } from "react-icons/fa";
import ConversationListItem from "./ConversationListItem";

const ConversationList = ({
    conversations,
    selectedConversation,
    loading,
    onSelectConversation,
    onClose
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
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ConversationList;

// components/chat/ConversationListItem.jsx
import ChatAvatar from "./ChatAvatar";

const ConversationListItem = ({ conversation, isSelected, onClick }) => {

    console.log(conversation);
    
    return (
        <button
            onClick={onClick}
            className={`w-full p-4 border-b hover:bg-gray-50 transition text-left ${isSelected ? "bg-blue-50" : ""
                }`}
        >
            <div className="flex items-start gap-3">
                <ChatAvatar username={conversation.other_user_username} size="lg" />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                            {conversation.buyer_username}
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

// hooks/useChat.js
import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";

export const useChat = (role) => {
    const [showChat, setShowChat] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    const getUserData = useCallback(() => {
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            return userData?.user_id;
        } catch (e) {
            console.error("Cannot parse userData:", e);
            return null;
        }
    }, []);

    const currentUserId = getUserData();

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const { data } = await api.get("/conversations/unread-count", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    }, [token]);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/conversations", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setConversations(data.data);
                return data.data; // คืนค่าข้อมูล conversations
            }
            return [];
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch messages
    const fetchMessages = useCallback(
        async (conversationId) => {
            try {
                const { data } = await api.get(
                    `/conversations/${conversationId}/messages`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { limit: 100, offset: 0 },
                    }
                );

                if (data.success) {
                    setMessages(data.data.messages);
                    await markAsRead(conversationId);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        },
        [token]
    );

    // Mark as read
    const markAsRead = useCallback(
        async (conversationId) => {
            try {
                await api.patch(
                    `/conversations/${conversationId}/read`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                fetchUnreadCount();
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        },
        [token, fetchUnreadCount]
    );

    // Send message
    const sendMessage = useCallback(async () => {
        if (!input.trim() || !selectedConversation) {
            return;
        }

        try {
            const { data } = await api.post(
                `/conversations/${selectedConversation.conversation_id}/messages`,
                { messageText: input },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (data.success) {
                setMessages((previousMessages) => {
                    return [...previousMessages, data.data];
                });
                setInput("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }, [input, selectedConversation, token]);

    // Handle chat click - เปิด/ปิด chat modal
    const handleChatClick = useCallback(async () => {
        setShowChat((previousShowChat) => {
            return !previousShowChat;
        });
        
        if (showChat === false) {
            await fetchConversations();
        }
    }, [showChat, fetchConversations]);

    // Handle conversation select - เลือก conversation และโหลดข้อความ
    const handleConversationSelect = useCallback(
        (conversation) => {
            console.log("🔵 เลือก conversation:", conversation);
            setSelectedConversation(conversation);
            fetchMessages(conversation.conversation_id);
        },
        [fetchMessages]
    );

    // Initial fetch unread count
    useEffect(() => {
        if (role !== "guest") {
            fetchUnreadCount();
        }
    }, [role, fetchUnreadCount]);

    return {
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
        fetchConversations, // ส่งออกเพื่อใช้ refresh ข้อมูล
    };
};