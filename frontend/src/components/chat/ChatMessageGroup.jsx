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