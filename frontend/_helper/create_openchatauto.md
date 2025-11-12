      {/* Chat Modal */}
      <ChatModal
        isOpen={showChat}
        conversations={conversations}
        selectedConversation={selectedConversation}
        messages={messages}
        input={input}
        loading={loading}
        currentUserId={currentUserId}
        onClose={() => setShowChat(false)}
        onSelectConversation={handleConversationSelect}
        onInputChange={setInput}
        onSendMessage={sendMessage}
      />