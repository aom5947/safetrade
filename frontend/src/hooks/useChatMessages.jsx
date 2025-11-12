// hooks/useChatMessages.js
import { useMemo } from "react";

export const useChatMessages = (messages, currentUserId, selectedConversation) => {
    const getSenderInfo = (msg) => {
        // Debug: ดูค่าที่เปรียบเทียบ
        console.log("Message sender_id:", msg.sender_id, typeof msg.sender_id);
        console.log("Current user_id:", currentUserId, typeof currentUserId);

        // const isMe = msg.sender_id === currentUserId;
        const isMe = Number(msg.sender_id) === Number(currentUserId);

        console.log("Is me?", isMe); // Debug

        if (isMe) {
            return {
                isMe: true,
                username: "คุณ",
                initial: localStorage.getItem("username")?.charAt(0).toUpperCase() || "M"
            };
        } else {
            return {
                isMe: false,
                username: selectedConversation?.buyer_username || "User",
                initial: selectedConversation?.other_user_username?.charAt(0).toUpperCase() || "U"
            };
        }
    };

    const groupedMessages = useMemo(() => {
        const grouped = [];
        let currentGroup = null;

        messages.forEach((msg, index) => {
            const senderInfo = getSenderInfo(msg);
            const prevMsg = messages[index - 1];
            const prevSenderInfo = prevMsg ? getSenderInfo(prevMsg) : null;

            // เริ่มกลุ่มใหม่เมื่อผู้ส่งเปลี่ยน
            if (!prevSenderInfo || prevSenderInfo.isMe !== senderInfo.isMe) {
                if (currentGroup) grouped.push(currentGroup);
                currentGroup = {
                    ...senderInfo,
                    messages: [msg]
                };
            } else {
                currentGroup.messages.push(msg);
            }

            // Push กลุ่มสุดท้าย
            if (index === messages.length - 1 && currentGroup) {
                grouped.push(currentGroup);
            }
        });

        return grouped;
    }, [messages, currentUserId, selectedConversation]);

    return groupedMessages;
};

export default useChatMessages;