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
                {/* Conversations List - เพิ่ม currentUserId prop */}
                {/* เพิ่ม prop นี้ */}
                <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    loading={loading}
                    onSelectConversation={onSelectConversation}
                    onClose={onClose}
                    currentUserId={currentUserId}
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