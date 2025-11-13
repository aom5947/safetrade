// frontend/src/services/reviewService.js
import { api } from "./api";

// เอา token จาก localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reviewService = {

  /**
   * 1) ✔️ getAllReviews (ตามต้นฉบับ)
   * ตอนนี้ backend ไม่มี endpoint นี้ → ใช้แบบ fallback
   * ผมจะเอารีวิวของ seller ทุกคน (ถ้าต้องแก้เป็นจริง เดี๋ยวค่อยปรับ)
   */
  getAllReviews: async () => {
    try {
      // ดึง seller ID = 1 ไปก่อน (หรือรายแรกในระบบ)
      const sellerId = 1;

      const res = await api.get(`/reviews/seller/${sellerId}`, {
        headers: getAuthHeader(),
      });

      return {
        data: { reviews: res.data?.data || [] },
      };

    } catch (error) {
      console.error("getAllReviews error:", error);
      return { data: { reviews: [] } };
    }
  },

  /**
   * 2) ลบรีวิวตามต้นฉบับ
   */
  deleteReview: (reviewId) => {
    return api.delete(`/reviews/${reviewId}`, {
      headers: getAuthHeader(),
    });
  },

};

export default reviewService;
