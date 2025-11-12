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