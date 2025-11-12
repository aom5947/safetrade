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
            {/* Chat Header - เพิ่ม currentUserId prop */}
            <ChatHeader 
                conversation={selectedConversation} 
                currentUserId={currentUserId} 
            />

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