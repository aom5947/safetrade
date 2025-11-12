// components/Navbar.jsx (Refactored)
import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import ChatModal from "./chat/ChatModal";
import NavbarLogo from "./navbar/NavbarLogo";
import NavbarLinks from "./navbar/NavbarLinks";
import NavbarActions from "./navbar/NavbarActions";
import MobileDrawer from "./navbar/MobileDrawer";

function Navbar({ role }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
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
  } = useChat(role);

  return (
    <>
      <nav className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <NavbarLogo />

            {/* Center: Navigation Links (Desktop) */}
            <NavbarLinks role={role} />

            {/* Right: Actions */}
            <NavbarActions
              role={role}
              unreadCount={unreadCount}
              menuOpen={menuOpen}
              onChatClick={handleChatClick}
              onMenuToggle={() => setMenuOpen(!menuOpen)}
            />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        role={role}
        menuOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

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
    </>
  );
}

export default Navbar;