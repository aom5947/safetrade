  // ListingsPage.jsx
  import React, { useState, useEffect, useCallback } from 'react';
  import { Search, Package, Plus, Edit, Eye, Trash2, CheckCircle } from 'lucide-react';
  import { toast } from 'sonner';

  import { Card, CardContent, CardHeader } from '@/components/Admin_components/ui/card';
  import { Input } from '@/components/Admin_components/ui/input';
  import { Button } from '@/components/Admin_components/ui/button';
  import { Badge } from '@/components/Admin_components/ui/badge';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/Admin_components/ui/table';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/Admin_components/ui/select';
  import { Loading } from '@/components/Admin_components/Loading';
  import { EmptyState } from '@/components/Admin_components/EmptyState';
  import { getStatusColor, getStatusDisplayName, formatCurrency } from '@/lib/utils';
  import { api } from '@/services/api';

  // Modal Components
  import ListingFormModal from './ListingFormModal';
  import ListingDetailModal from './ListingDetailModal';
  import StatusUpdateModal from './StatusUpdateModal';

  const ListingsPage = () => {
    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
    });

    // Filters
    const [filters, setFilters] = useState({
      q: '',
      categoryId: 'all',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      location: '',
      sort: 'newest',
    });

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);

    const token = localStorage.getItem("token");

    // Fetch Categories
    const fetchCategories = useCallback(async () => {
      try {
        const response = await api.get('/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(response.data?.categories || []);
      } catch (error) {
        console.error('fetchCategories error', error);
      }
    }, [token]);

    // Fetch Listings
    const fetchListings = useCallback(
      async (page = pagination.page) => {
        console.log(filters.categoryId);
        
        try {
          setLoading(true);

          const params = {
            q: filters.q || undefined,
            categoryId: filters.categoryId !== 'all' ? filters.categoryId : undefined,
            status: filters.status !== 'all' ? filters.status : undefined,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            location: filters.location || undefined,
            sort: filters.sort || 'newest',
            page,
            limit: pagination.limit,
          };

          // Remove undefined values
          Object.keys(params).forEach(key =>
            params[key] === undefined && delete params[key]
          );

          const response = await api.get('/listings', { params });
          setListings(response.data?.listings || []);

          // Update pagination
          if (response.data?.pagination) {
            setPagination(prev => ({
              ...prev,
              ...response.data.pagination,
              page: response.data.pagination.page || page,
            }));
          }
        } catch (error) {
          console.error('fetchListings error', error);
          toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
          setLoading(false);
        }
      },
      [filters, pagination.limit]
    );

    useEffect(() => {
      fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
      fetchListings(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle Filter Change
    const handleFilterChange = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Handle Search
    const handleSearch = () => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchListings(1);
    };

    // Handle Reset Filters
    const handleResetFilters = () => {
      setFilters({
        q: '',
        categoryId: 'all',
        status: 'all',
        minPrice: '',
        maxPrice: '',
        location: '',
        sort: 'newest',
      });
      setPagination(prev => ({ ...prev, page: 1 }));
      setTimeout(() => fetchListings(1), 100);
    };

    // Handle Page Change
    const handlePageChange = (newPage) => {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchListings(newPage);
    };

    // ✅ Fix: View Listing Detail with proper error handling
    const handleViewDetail = async (listingId) => {
      try {
        const response = await api.get(`/listings/${listingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ Debug: ตรวจสอบโครงสร้างข้อมูล
        console.log('Listing detail response:', response.data);

        const listingData = response.data?.listing || response.data;

        // ✅ Fix: ตรวจสอบว่า images มีข้อมูลหรือไม่
        if (!listingData.images || listingData.images.length === 0) {
          console.warn('No images found in listing');
        }

        setSelectedListing(listingData);
        setShowDetailModal(true);
      } catch (error) {
        console.error('fetch listing detail error', error);
        toast.error('ไม่สามารถโหลดรายละเอียดได้');
      }
    };

    // ✅ New: Refresh listing detail after image deletion
    const handleImageDeleted = async (listingId) => {
      try {
        const response = await api.get(`/listings/${listingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const listingData = response.data?.listing || response.data;
        setSelectedListing(listingData);

        // Also refresh the listings table
        fetchListings(pagination.page);
      } catch (error) {
        console.error('refresh listing error', error);
      }
    };

    // Handle Edit
    const handleEdit = async (listingId) => {
      try {
        const response = await api.get(`/listings/${listingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSelectedListing(response.data?.listing || response.data);
        setShowEditModal(true);
      } catch (error) {
        console.error('fetch listing for edit error', error);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      }
    };

    // Create Listing
    const handleCreateListing = async (data) => {
      try {
        await api.post('/listings', data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('สร้างประกาศสำเร็จ');
        setShowCreateModal(false);
        fetchListings(1);
      } catch (error) {
        console.error('create listing error', error);
        toast.error(error.response?.data?.message || 'ไม่สามารถสร้างประกาศได้');
        throw error;
      }
    };

    // Update Listing
    const handleUpdateListing = async (listingId, data) => {
      try {
        await api.put(`/listings/${listingId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('อัพเดทประกาศสำเร็จ');
        setShowEditModal(false);
        setSelectedListing(null);
        fetchListings(pagination.page);
      } catch (error) {
        console.error('update listing error', error);
        toast.error(error.response?.data?.message || 'ไม่สามารถอัพเดทได้');
        throw error;
      }
    };

    // Update Status
    const handleUpdateStatus = async (listingId, status, rejectionReason = null) => {
      try {
        console.log(listingId, status);
        
        await api.patch(
          `/listings/${listingId}/status`,
          {
            status,
            rejection_reason: rejectionReason
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success('อัพเดทสถานะสำเร็จ');
        setShowStatusModal(false);
        setSelectedListing(null);
        fetchListings(pagination.page);
      } catch (error) {
        console.error('update status error', error);
        toast.error(error.response?.data?.message || 'ไม่สามารถอัพเดทสถานะได้');
        throw error;
      }
    };

    // Handle Status Change
    const handleStatusChange = (listing) => {
      setSelectedListing(listing);
      setShowStatusModal(true);
    };

    // Delete Listing
    const handleDelete = async (listingId) => {
      if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?')) return;

      try {
        await api.delete(`/listings/${listingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('ลบประกาศสำเร็จ');
        fetchListings(pagination.page);
      } catch (error) {
        console.error('delete listing error', error);
        toast.error(error.response?.data?.message || 'ไม่สามารถลบประกาศได้');
      }
    };
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">จัดการประกาศ</h1>
                <p className="text-muted-foreground mt-1">
                  จัดการประกาศขายสินค้าทั้งหมดในระบบ
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="ค้นหาประกาศ..."
                    value={filters.q}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Category Filter */}
              {/* <Select
                value={filters.categoryId}
                onValueChange={(value) => handleFilterChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="หมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="pending">รออนุมัติ</SelectItem>
                  <SelectItem value="active">อนุมัติแล้ว</SelectItem>
                  <SelectItem value="rejected">ถูกปฏิเสธ</SelectItem>
                  <SelectItem value="expired">หมดอายุ</SelectItem>
                </SelectContent>
              </Select>

              {/* Location */}
              <Input
                placeholder="สถานที่"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />

              {/* Min Price */}
              <Input
                type="number"
                placeholder="ราคาต่ำสุด"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />

              {/* Max Price */}
              <Input
                type="number"
                placeholder="ราคาสูงสุด"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />

              {/* Sort */}
              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange('sort', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
                  <SelectItem value="price_low">ราคาต่ำ-สูง</SelectItem>
                  <SelectItem value="price_high">ราคาสูง-ต่ำ</SelectItem>
                  <SelectItem value="most_viewed">ยอดดูสูงสุด</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleSearch} className="flex-1">
                ค้นหา
              </Button>
              <Button onClick={handleResetFilters} variant="outline">
                รีเซ็ต
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listings Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <Loading />
            ) : listings.length === 0 ? (
              <EmptyState icon={Package} title="ไม่พบประกาศ" />
            ) : (
              <>
                <div className="rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ประกาศ</TableHead>
                        <TableHead>ราคา</TableHead>
                        <TableHead>ผู้ขาย</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>สถิติ</TableHead>
                        <TableHead className="text-right">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => {
                        const sellerName =
                          listing.seller_first_name || listing.seller_last_name
                            ? `${listing.seller_first_name || ''} ${listing.seller_last_name || ''}`.trim()
                            : listing.seller_username || '-';

                        return (
                          <TableRow key={listing.listing_id}>
                            {/* Listing Info */}
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                {listing.thumbnail && (
                                  <img
                                    src={listing.thumbnail}
                                    alt={listing.title}
                                    className="w-16 h-12 object-cover rounded"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/64x48?text=No+Image';
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{listing.title}</div>
                                  {listing.category_name && (
                                    <div className="text-xs text-muted-foreground">
                                      {listing.category_name}
                                    </div>
                                  )}
                                  {listing.location && (
                                    <div className="text-xs text-muted-foreground">{listing.location}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Price */}
                            <TableCell className="font-semibold">
                              {formatCurrency(listing.price)}
                            </TableCell>

                            {/* Seller */}
                            <TableCell>
                              <div>
                                <div className="font-medium">{sellerName}</div>
                                {listing.seller_rating && (
                                  <div className="text-xs text-muted-foreground">
                                    ⭐ {parseFloat(listing.seller_rating).toFixed(1)}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge className={getStatusColor(listing.status)}>
                                {getStatusDisplayName(listing.status)}
                              </Badge>
                            </TableCell>

                            {/* Stats */}
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Eye className="h-3 w-3" />
                                  <span>{listing.view_count || 0} ครั้ง</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ติดต่อ: {listing.contact_count || 0}
                                </div>
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleViewDetail(listing.listing_id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleEdit(listing.listing_id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleStatusChange(listing)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => handleDelete(listing.listing_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      แสดง {listings.length} จาก {pagination.totalCount} รายการ
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        ก่อนหน้า
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          หน้า {pagination.page} / {pagination.totalPages}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        ถัดไป
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {showCreateModal && (
          <ListingFormModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateListing}
            categories={categories}
            mode="create"
          />
        )}

        {showEditModal && selectedListing && (
          <ListingFormModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedListing(null);
            }}
            onSubmit={(data) => handleUpdateListing(selectedListing.listing_id, data)}
            categories={categories}
            mode="edit"
            initialData={selectedListing}
          />
        )}

        {/* ✅ Fix: เพิ่ม onImageDeleted prop */}
        {showDetailModal && selectedListing && (
          <ListingDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedListing(null);
            }}
            listing={selectedListing}
            onImageDeleted={handleImageDeleted}
          />
        )}

        {showStatusModal && selectedListing && (
          <StatusUpdateModal
            isOpen={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedListing(null);
            }}
            listing={selectedListing}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    );
  };

  export default ListingsPage;