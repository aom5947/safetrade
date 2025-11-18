import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function useSellerProfile(sellerId) {
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSellerProfile = async () => {
            if (!sellerId) return;

            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/sellers/${sellerId}`);

                if (response.data.success && response.data.data) {
                    setSeller(response.data.data);
                } else {
                    setError('ไม่พบข้อมูลผู้ขาย');
                }
            } catch (err) {
                console.error('Error fetching seller profile:', err);
                if (err.response?.status === 404) {
                    setError('ไม่พบผู้ขายที่คุณค้นหา');
                } else {
                    setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSellerProfile();
    }, [sellerId]);

    return { seller, loading, error };
}
