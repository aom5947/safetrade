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
  // ขั้นตอนของ authentication: "login" | "signup" | "profile"
  const [authStep, setAuthStep] = useState("login");
  const [signupMobile, setSignupMobile] = useState("");  // ⭐ เก็บเบอร์มือถือจาก Signup

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    onClose();
    setAuthStep("login"); // reset เวลาเปิดรอบใหม่จะเริ่มที่ login
  };

  const handleModalClick = (event) => {
    // ป้องกันไม่ให้ปิด modal เมื่อคลิกภายใน modal
    event.stopPropagation();
  };

  const handleSwitchToSignup = () => {
    setAuthStep("signup");
  };

  // ⭐ รับ mobile จาก Signup แล้วเก็บไว้ ก่อนเปลี่ยนไปหน้า profile
  const handleContinueToProfile = (mobile) => {
    console.log("📱 ได้เบอร์จาก Signup:", mobile);   // ลองเช็คใน console
    setSignupMobile(mobile || "");
    setAuthStep("profile");
  };

  /**
   * handleAuthenticationSuccess
   * - mode = "login"  → login สำเร็จ
   * - mode = "signup" → signup + profile setup สำเร็จ
   */
  const handleAuthenticationSuccess = (user, mode) => {
    setAuthStep("login"); // reset step สำหรับครั้งถัดไป
    if (onAuthSuccess) {
      onAuthSuccess(user, mode);
    }
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
          onClick={() => {
            onClose();
            setAuthStep("login");
          }}
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
            onSuccess={(user) => handleAuthenticationSuccess(user, "login")}
          />
        )}

        {authStep === "signup" && (
          <Signup
            onContinue={handleContinueToProfile}   // ⭐ ตอนนี้มือถือจะถูกส่งเข้ามาที่ handleContinueToProfile(mobile)
            onSwitch={() => setAuthStep("login")}
          />
        )}

        {authStep === "profile" && (
          <ProfileSetup
            mobile={signupMobile}                  // ⭐ ส่งเบอร์เข้าไปใน ProfileSetup (ไม่มีช่องให้แก้ก็ได้)
            onFinish={(user) => handleAuthenticationSuccess(user, "signup")}
          />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
