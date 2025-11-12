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
