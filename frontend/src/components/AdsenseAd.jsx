// src/components/AdsenseAd.jsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * AdsenseAd Component
 * ใช้แสดงโฆษณา AdSense ในเว็บแบบ SPA
 *
 * Props:
 *  - client: string   // เช่น "ca-pub-1824806465207098"
 *  - slot: string     // หมายเลข ad slot
 *  - className: string (optional)
 *  - style: object (optional)
 *  - format: string (optional)
 */
export default function AdsenseAd({
  client,
  slot,
  className = "block",
  style = { display: "block" },
  format = "auto",
}) {
  const location = useLocation();
  const containerRef = useRef(null);
  const pushedRef = useRef(false);

  // โหลดสคริปต์ AdSense แค่ครั้งเดียว (เหมือนโค้ดในรูป)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SCRIPT_ID = "adsense-script";
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      // ❗ ใช้รูปแบบเดียวกับที่ Google ให้มา: ?client=... + crossorigin="anonymous"
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [client]);

  // รีโหลดโฆษณาเมื่อ path เปลี่ยน (SPA)
  useEffect(() => {
    pushedRef.current = false;

    const adElement = containerRef.current?.querySelector("ins.adsbygoogle");
    if (!adElement) return;

    // clone node เพื่อให้ adsbygoogle push ได้ใหม่
    const clone = adElement.cloneNode(false);
    adElement.parentNode?.replaceChild(clone, adElement);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !pushedRef.current) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushedRef.current = true;
          } catch (err) {
            console.warn("⚠️ AdSense push failed:", err);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(clone);
    return () => observer.disconnect();
  }, [location.pathname, slot]);

  return (
    <div ref={containerRef} className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={client}  // ca-pub-XXXX จากรูป
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
