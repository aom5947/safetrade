import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function useSellerListings(sellerId, activeTab, searchQuery) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        const fetchListings = async () => {
            if (!sellerId || activeTab === 'reviews') return;

            try {
                setLoading(true)

                let status = activeTab === 'sold' ? 'sold'
                    : activeTab === 'statusPending' ? 'pending'
                        : 'active';

                const response = await api.get(`/sellers/${sellerId}/listings`, {
                    params: {
                        status,
                        page: pagination.page,
                        limit: pagination.limit,
                        q: searchQuery || undefined
                    }
                });

                if (response.data.success) {
                    setListings(response.data.data || []);

                    if (response.data.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            total: response.data.pagination.total,
                            totalPages: response.data.pagination.totalPages
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching listings:', err);
                setListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [sellerId, activeTab, pagination.page, searchQuery]);

    const setPage = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const resetPage = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return {
        listings,
        loading,
        pagination,
        setPage,
        resetPage
    };
}
