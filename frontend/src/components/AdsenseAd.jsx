// src/components/AdsenseAd.jsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * ✅ AdsenseAd Component (React 19+, Tailwind-ready)
 * รองรับการใช้งานในเว็บแบบ SPA (Single Page App)
 * โหลด script ครั้งเดียว + re-render โฆษณาเมื่อ route เปลี่ยน
 *
 * Props:
 *  - client: string   // เช่น "ca-pub-XXXXXXXXXXXX"
 *  - slot: string     // หมายเลข ad slot จากบัญชี AdSense
 *  - className: string (optional)  // Tailwind classes ของ container
 *  - style: object (optional)      // inline style ของ <ins>
 *  - format: string (optional)     // เช่น "auto" หรือ "rectangle"
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

  // โหลดสคริปต์ AdSense แค่ครั้งเดียว
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SCRIPT_ID = "adsense-script";
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      script.setAttribute("data-ad-client", client);
      document.head.appendChild(script);
    }
  }, [client]);

  // รีโหลดโฆษณาเมื่อ path เปลี่ยน (SPA)
  useEffect(() => {
    pushedRef.current = false;

    const adElement = containerRef.current?.querySelector("ins.adsbygoogle");
    if (!adElement) return;

    // clone node เพื่อรี render
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
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
