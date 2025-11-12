import { useState, useEffect } from "react";
import { api } from "@/services/api";

/**
 * Custom hook สำหรับดึงรายละเอียดสินค้า/ประกาศ
 * 
 * @param {string|number} productId - ID ของประกาศ
 * @returns {Object} { product, isLoading, error, refetch }
 */
export function useProductDetails(productId) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * ดึงข้อมูลสินค้าจาก API
   */
  const fetchProductDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching product details:", productId);

      const response = await api.get(`/listings/${productId}`);

      console.log(response);
      

      if (response.data?.success) {
        setProduct(response.data.listing);
        console.log("✅ Product loaded:", response.data.listing);
      } else {
        setError("ไม่พบข้อมูลสินค้า");
      }
    } catch (err) {
      console.error("❌ Error fetching product:", err);

      // Handle specific error cases
      if (err.response?.status === 404) {
        setError("ไม่พบประกาศนี้");
      } else {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product when productId changes
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  /**
   * Refetch function สำหรับดึงข้อมูลใหม่
   */
  const refetch = () => {
    if (productId) {
      fetchProductDetails();
    }
  };

  return {
    product,
    isLoading,
    error,
    refetch,
  };
}
