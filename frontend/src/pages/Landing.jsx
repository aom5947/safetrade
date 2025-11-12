import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// Custom Hooks
import { useCategories } from "@/hooks/useCategories";
import { useLatestListings } from "@/hooks/useLatestListings";

// Utilities
import { fetchCategoryBySlug } from "@/utils/categoryUtils";

// Components
import HeroSection from "@/components/HeroSection.jsx";
import LatestListingsSection from "@/components/LatestListingsSection.jsx";
import FooterCategories from "@/components/FooterCategories.jsx";
import AuthModal from "@/components/AuthModal.jsx";
import AdsenseAd from "@/components/AdsenseAd.jsx";

/**
 * Landing Page Component
 * 
 * หน้าแรกของเว็บไซต์ที่แสดง:
 * - Hero section พร้อม call-to-action
 * - ประกาศล่าสุด
 * - หมวดหมู่สินค้าทั้งหมดใน footer
 * - Modal สำหรับ authentication
 * 
 * @param {Function} setToken - function สำหรับจัดการ authentication token
 * @param {Object} user - ข้อมูล user ที่ login อยู่
 * @param {Function} setUsers - function สำหรับจัดการ users state
 */
function Landing({ setToken, user, setUsers, setRole, role }) {
  const navigate = useNavigate();

  // สถานะสำหรับ Auth Modal (null = ปิด, "login" = เปิด)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ใช้ custom hooks สำหรับดึงข้อมูล
  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories();

  const {
    latestListings,
    isLoading: isLoadingListings,
    error: listingsError,
  } = useLatestListings(4);

  /**
   * Initialize AOS (Animate On Scroll) library
   * ใช้สำหรับ animation เมื่อ scroll
   */
  useEffect(() => {
    AOS.init({
      duration: 800, // ระยะเวลา animation (มิลลิวินาที)
      once: true, // animate เพียงครั้งเดียว
    });
  }, []);

  /**
   * Handle เมื่อคลิกปุ่ม Signup/Login
   */
  const handleAuthButtonClick = () => {
    setIsAuthModalOpen(true);
  };

  /**
   * Handle เมื่อปิด Auth Modal
   */
  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * Handle เมื่อ authentication สำเร็จ
   * นำทางไปยังหน้า marketplace
   */
  const handleAuthSuccess = (authenticatedUser) => {
    setIsAuthModalOpen(false);
    navigate("/marketplace");
  };

  /**
   * Handle เมื่อคลิกที่หมวดหมู่ย่อย
   * ดึงข้อมูลหมวดหมู่และนำทางไปยังหน้าหมวดหมู่นั้น
   */
  const handleSubcategoryClick = async (slug) => {
    // ดึงข้อมูลหมวดหมู่จาก API
    const categoryData = await fetchCategoryBySlug(slug);

    if (categoryData) {
      console.log("✅ Category data loaded:", categoryData);

      // นำทางไปยังหน้าหมวดหมู่พร้อมส่งข้อมูลไปด้วย
      navigate(`/category/${slug}`, {
        state: { category: categoryData },
      });
    } else {
      // แสดงข้อความเตือนถ้าไม่พบหมวดหมู่
      alert("ไม่พบหมวดหมู่หรือเกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50s">
      {/* Hero Section - ส่วนแสดงหัวข้อหลักและปุ่ม auth */}
      <HeroSection onAuthClick={handleAuthButtonClick} />

      {/* โฆษณาใต้ Hero Section */}
      <section aria-label="sponsored" className="-mt-6 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
            <div className="px-4 py-2 text-[11px] uppercase tracking-wide text-slate-500/80">โฆษณา</div>
            <div className="px-2 pb-4">
              <AdsenseAd
                 client="ca-pub-1234567890123456"  // ของจริงจากบัญชี AdSense
                  slot="9876543210"
                className="w-full"
                style={{ display: "block", minHeight: 90 }}
                format="auto"
              />
            </div>
          </div>
        </div>
      </section>

      <LatestListingsSection
        listings={latestListings}
        isLoading={isLoadingListings}
        error={listingsError}
      />

      <FooterCategories
        categories={categories}
        isLoading={isLoadingCategories}
        error={categoriesError}
        onSubcategoryClick={handleSubcategoryClick}
      />

      {/* Auth Modal - modal สำหรับ login/signup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
        setToken={setToken}
        setUsers={setUsers}
        setRole={setRole}
      />
    </div>
  );
}

export default Landing;
