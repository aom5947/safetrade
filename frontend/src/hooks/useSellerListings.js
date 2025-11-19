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
                setLoading(true);

                // สำหรับ statusPending ต้องดึง 3 status
                if (activeTab === 'statusPending') {
                    const statuses = ['pending', 'hidden', 'rejected'];
                    const promises = statuses.map(status =>
                        api.get(`/sellers/${sellerId}/listings`, {
                            params: {
                                status,
                                page: pagination.page,
                                limit: pagination.limit,
                                q: searchQuery || undefined
                            }
                        })
                    );

                    const responses = await Promise.all(promises);
                    
                    // รวมข้อมูลจาก 3 API calls
                    const allListings = responses.flatMap(response => 
                        response.data.success ? response.data.data || [] : []
                    );

                    // คำนวณ pagination รวม
                    const totalItems = responses.reduce((sum, response) => 
                        sum + (response.data.pagination?.total || 0), 0
                    );

                    setListings(allListings);
                    setPagination(prev => ({
                        ...prev,
                        total: totalItems,
                        totalPages: Math.ceil(totalItems / prev.limit)
                    }));

                } else {
                    // สำหรับ tab อื่นๆ เรียกแบบเดิม
                    let status;
                    if (activeTab === 'sold') {
                        status = 'sold';
                    } else if (activeTab === 'rejected') {
                        status = 'rejected';
                    } else if (activeTab === 'hidden') {
                        status = 'hidden';
                    } else {
                        status = 'active';
                    }

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

// import { useState, useEffect } from 'react';
// import { api } from '@/services/api';

// export function useSellerListings(sellerId, activeTab, searchQuery) {
//     const [listings, setListings] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [pagination, setPagination] = useState({
//         page: 1,
//         limit: 20,
//         total: 0,
//         totalPages: 0
//     });

//     useEffect(() => {
//         const fetchListings = async () => {
//             if (!sellerId || activeTab === 'reviews') return;

//             try {
//                 setLoading(true)

//                 // let status = activeTab === 'sold' ? 'sold'
//                 //     : activeTab === 'statusPending' ? 'pending'
//                 //         : 'active';

//                 let status;

//                 if (activeTab === 'sold') {
//                     status = 'sold';
//                 } else if (activeTab === 'statusPending') {
//                     status = 'pending';
//                 } else if (activeTab === 'rejected') {
//                     status = 'rejected';
//                 } else if (activeTab === 'hidden') {
//                     status = 'hidden';
//                 } else {
//                     status = 'active';
//                 }

//                 const response = await api.get(`/sellers/${sellerId}/listings`, {
//                     params: {
//                         status,
//                         page: pagination.page,
//                         limit: pagination.limit,
//                         q: searchQuery || undefined
//                     }
//                 });

//                 if (response.data.success) {
//                     setListings(response.data.data || []);

//                     if (response.data.pagination) {
//                         setPagination(prev => ({
//                             ...prev,
//                             total: response.data.pagination.total,
//                             totalPages: response.data.pagination.totalPages
//                         }));
//                     }
//                 }
//             } catch (err) {
//                 console.error('Error fetching listings:', err);
//                 setListings([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchListings();
//     }, [sellerId, activeTab, pagination.page, searchQuery]);

//     const setPage = (page) => {
//         setPagination(prev => ({ ...prev, page }));
//     };

//     const resetPage = () => {
//         setPagination(prev => ({ ...prev, page: 1 }));
//     };

//     return {
//         listings,
//         loading,
//         pagination,
//         setPage,
//         resetPage
//     };
// }


