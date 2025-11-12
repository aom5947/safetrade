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