import { useState } from "react";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup.jsx";
import ProfileSetup from "@/pages/auth/ProfileSetup.jsx";

/**
 * Auth Modal component
 * แสดง modal สำหรับ authentication (login, signup, profile setup)
 * 
 * @param {boolean} isOpen - สถานะการเปิด/ปิด modal
 * @param {Function} onClose - callback เมื่อปิด modal
 * @param {Function} onAuthSuccess - callback เมื่อ authentication สำเร็จ
 * @param {Function} setToken - function สำหรับ set token
 * @param {Function} setUsers - function สำหรับ set users
 */
function AuthModal({ isOpen, onClose, onAuthSuccess, setToken, setUsers, setRole }) {
  // ขั้นตอนของ authentication: null (ปิด) | "login" | "signup" | "profile"
  const [authStep, setAuthStep] = useState("login");

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleModalClick = (event) => {
    // ป้องกันไม่ให้ปิด modal เมื่อคลิกภายใน modal
    event.stopPropagation();
  };

  const handleSwitchToSignup = () => {
    setAuthStep("signup");
  };

  const handleContinueToProfile = () => {
    setAuthStep("profile");
  };

  const handleAuthenticationSuccess = (user) => {
    setAuthStep("login"); // Reset step สำหรับครั้งถัดไป
    onAuthSuccess(user);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-[400px] relative"
        onClick={handleModalClick}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Auth Step Content */}
        {authStep === "login" && (
          <Login
            setUsers={setUsers}
            setToken={setToken}
            setRole={setRole}
            onSwitch={handleSwitchToSignup}
            onSuccess={handleAuthenticationSuccess}
          />
        )}

        {authStep === "signup" && (
          <Signup onContinue={handleContinueToProfile} />
        )}

        {authStep === "profile" && (
          <ProfileSetup onFinish={handleAuthenticationSuccess} />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
