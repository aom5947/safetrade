import { useState, useEffect } from "react";
import { api } from "@/services/api";

/**
 * แปลงข้อมูล listing จาก API เป็นรูปแบบที่ใช้แสดงผล
 * 
 * @param {Object} listing - ข้อมูล listing จาก API
 * @returns {Object} ข้อมูล listing ที่แปลงแล้ว
 */
function transformListingData(listing) {
  // ตรวจสอบว่าประกาศอายุไม่เกิน 7 วัน (สำหรับแสดง badge "NEW")
  const createdDate = new Date(listing.created_at);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isNew = listing.created_at && createdDate > sevenDaysAgo;

  return {
    id: listing.listing_id,
    image: listing.thumbnail || "/placeholder-listing.png",
    name: listing.title,
    price: listing.price,
    location: listing.location || "",
    badge: isNew ? "NEW" : null,
  };
}

/**
 * Custom hook สำหรับดึงประกาศล่าสุด
 * 
 * @param {number} limit - จำนวนประกาศที่ต้องการดึง (default: 4)
 * @returns {Object} { latestListings, isLoading, error }
 */
export function useLatestListings(limit = 4) {
  const [latestListings, setLatestListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestListings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get("/listings", {
          params: { 
            sort: "newest", 
            limit: limit 
          },
        });

        // ตรวจสอบว่า component ยัง mount อยู่หรือไม่
        if (!isMounted) return;

        if (response.data?.success) {
          const listings = response.data.listings || [];

          console.log(listings, "sad");
          
          
          const transformedListings = listings.map(transformListingData);
          console.log(transformedListings, "sad");
          setLatestListings(transformedListings);
        } else {
          setLatestListings([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch latest listings:", error);
        if (isMounted) {
          setError(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLatestListings();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { latestListings, isLoading, error };
}
