import { useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook สำหรับการ copy ข้อความไปยัง clipboard
 * 
 * @returns {Object} { copyToClipboard, copied, error }
 */
export function useClipboard() {
  // เก็บ label ของสิ่งที่ copy ไปล่าสุด
  const [copied, setCopied] = useState("");

  // เก็บ error ถ้ามี
  const [error, setError] = useState(null);

  /**
   * Copy ข้อความไปยัง clipboard
   * 
   * @param {string} text - ข้อความที่จะ copy
   * @param {string} label - label สำหรับแสดงผล (เช่น "phone", "line")
   * @returns {Promise<boolean>} true ถ้า copy สำเร็จ, false ถ้าล้มเหลว
   */
  const copyToClipboard = async (text, label = "") => {
    // ตรวจสอบว่ามีข้อความที่จะ copy หรือไม่
    if (!text || text === "—") {
      console.warn("⚠️ No text to copy");
      return false;
    }

    try {
      // ใช้ Clipboard API
      await navigator.clipboard.writeText(text);

      // Set label ที่ copy สำเร็จ
      setCopied(label);
      setError(null);

      toast.success(`คัดลอก${label} แล้ว`)
      console.log(`✅ Copied ${label || "text"}:`, text);

      // Clear copied state หลังจาก 1.2 วินาที
      setTimeout(() => {
        setCopied("");
      }, 1200);

      return true;
    } catch (err) {
      console.error("❌ Clipboard error:", err);
      setError("ไม่สามารถคัดลอกได้");

      // Clear error หลังจาก 3 วินาที
      setTimeout(() => {
        setError(null);
      }, 3000);

      return false;
    }
  };

  /**
   * Reset copied state
   */
  const resetCopied = () => {
    setCopied("");
  };

  /**
   * ตรวจสอบว่า Clipboard API รองรับหรือไม่
   */
  const isSupported = () => {
    return !!navigator?.clipboard?.writeText;
  };

  return {
    copyToClipboard,
    copied,
    error,
    resetCopied,
    isSupported: isSupported(),
  };
}
