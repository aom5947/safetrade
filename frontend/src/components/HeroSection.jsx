import { useNavigate } from "react-router-dom";
import mascot from "@/assets/mascot.png";

/**
 * Hero Section component - ส่วนแสดงหัวข้อหลักและ mascot
 * แสดงชื่อเว็บไซต์, ข้อความต้อนรับ, และปุ่ม signup/login
 * 
 * @param {Function} onAuthClick - callback เมื่อคลิกปุ่ม Signup/Login
 */
function HeroSection({ onAuthClick }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <section className="relative bg-gradient-to-b from-[#1e3c72] to-[#2a5298] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Navigation Bar */}
        <div
          className="flex justify-between items-center"
          data-aos="fade-down"
        >
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleLogoClick}
          >
            <span className="text-xl font-bold tracking-wide">SafeTrade</span>
          </div>

          {/* Auth Button */}
          <button
            onClick={onAuthClick}
            className="bg-white text-blue-700 px-6 py-2 rounded-full shadow hover:scale-110 hover:shadow-xl transition text-sm font-semibold"
          >
            Signup / Login
          </button>
        </div>

        {/* Hero Content */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center pb-12">
          {/* Left Side - Text Content */}
          <div data-aos="fade-right">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
              ตลาดประกาศมือสอง
              <br className="hidden md:block" />
              ค้นหาของที่ต้องการได้ที่นี่
            </h1>
            <p className="mt-3 text-cyan-200 text-lg">
              ลงประกาศง่าย ติดต่อผู้ขายโดยตรง ปลอดค่าธรรมเนียม
            </p>
          </div>

          {/* Right Side - Mascot Image */}
          <div className="flex justify-end" data-aos="zoom-in">
            <img
              src={mascot}
              alt="SafeTrade Mascot"
              className="max-h-[320px] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)] translate-y-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
