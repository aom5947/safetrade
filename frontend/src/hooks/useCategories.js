import { useState, useEffect } from "react";
import { api } from "@/services/api";

/**
 * Custom hook สำหรับดึงและจัดการข้อมูลหมวดหมู่
 * 
 * @returns {Object} { categories, isLoading, error }
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get("/categories");
        
        // ตรวจสอบว่า component ยัง mount อยู่หรือไม่ (ป้องกัน memory leak)
        if (!isMounted) return;

        if (response.data?.success && Array.isArray(response.data.categories)) {
          // กรองเฉพาะหมวดหมู่ที่ active และเรียงตาม display_order
          const activeCategories = response.data.categories
            .filter((category) => category.is_active)
            .sort((a, b) => a.display_order - b.display_order);
          
          setCategories(activeCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
        if (isMounted) {
          setError(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    // Cleanup function เพื่อป้องกันการ update state หลัง unmount
    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, isLoading, error };
}
