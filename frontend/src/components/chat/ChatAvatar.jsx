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

