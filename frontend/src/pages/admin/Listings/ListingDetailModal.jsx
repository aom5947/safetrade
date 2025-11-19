// ListingDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Eye, Phone, Calendar, User, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/Admin_components/ui/dialog';
import { Button } from '@/components/Admin_components/ui/button';
import { Badge } from '@/components/Admin_components/ui/badge';
import { getStatusColor, getStatusDisplayName, formatCurrency } from '@/lib/utils';

const ListingDetailModal = ({ isOpen, onClose, listing, onImageDeleted }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [localImages, setLocalImages] = useState([]);

  // ✅ Fix: Update localImages เมื่อ listing เปลี่ยน
  useEffect(() => {
    if (listing?.images) {
      setLocalImages(listing.images);
      setCurrentImageIndex(0); // Reset to first image
    }
  }, [listing?.images]);

  if (!listing) return null;

  const token = localStorage.getItem("token");

  const sellerName =
    listing.seller_first_name || listing.seller_last_name
      ? `${listing.seller_first_name || ''} ${listing.seller_last_name || ''}`.trim()
      : listing.seller_username || 'ไม่ระบุ';

  // ✅ Fix: Normalize images properly
  const images = Array.isArray(localImages) ? localImages.map((img, idx) => {
    if (typeof img === 'string') {
      return { image_id: null, image_url: img };
    }
    return img;
  }) : [];

  const currentImage = images[currentImageIndex];

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleDeleteImage = async (imageId, index) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?')) return;

    // ✅ Fix: ต้องมี imageId จริงๆ ถึงจะลบได้
    if (!imageId) {
      toast.error('ไม่สามารถลบรูปภาพนี้ได้');
      return;
    }

    try {
      setDeletingImageId(imageId);
      
      // ✅ Fix: เพิ่ม Authorization header
      await api.delete(`/listings/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.success('ลบรูปภาพสำเร็จ');

      // Remove from local state
      const newImages = [...localImages];
      newImages.splice(index, 1);
      setLocalImages(newImages);

      // Adjust current index
      if (currentImageIndex >= newImages.length && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      }

      // ✅ Fix: Notify parent to refresh listing data
      if (onImageDeleted) {
        onImageDeleted(listing.listing_id);
      }
    } catch (error) {
      console.error('delete image error', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถลบรูปภาพได้');
    } finally {
      setDeletingImageId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>รายละเอียดประกาศ</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images Section */}
          {images.length > 0 ? (
            <div className="space-y-2">
              {/* Main Image */}
              <div className="relative">
                <img
                  src={currentImage.image_url}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                  }}
                />

                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/70 transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={currentImageIndex === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/70 transition-all"
                    >
                      →
                    </button>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Delete Image Button */}
                {currentImage.image_id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteImage(currentImage.image_id, currentImageIndex)}
                    disabled={deletingImageId === currentImage.image_id}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deletingImageId === currentImage.image_id ? 'กำลังลบ...' : 'ลบรูป'}
                  </Button>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={img.image_id || index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded border-2 transition-all ${
                        currentImageIndex === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=?';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
              <p className="text-muted-foreground">ไม่มีรูปภาพ</p>
            </div>
          )}

          {/* Title and Status */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold">{listing.title}</h2>
              <Badge className={getStatusColor(listing.status)}>
                {getStatusDisplayName(listing.status)}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-primary mt-2">
              {formatCurrency(listing.price)}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">รายละเอียด</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {listing.category_name && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">หมวดหมู่</div>
                  <div className="font-medium">{listing.category_name}</div>
                </div>
              </div>
            )}

            {listing.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">สถานที่</div>
                  <div className="font-medium">{listing.location}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">ผู้ขาย</div>
                <div className="font-medium">{sellerName}</div>
                {listing.seller_rating && (
                  <div className="text-xs text-muted-foreground">
                    ⭐ {parseFloat(listing.seller_rating).toFixed(1)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">จำนวนการดู</div>
                <div className="font-medium">{listing.view_count || 0} ครั้ง</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">จำนวนการติดต่อ</div>
                <div className="font-medium">{listing.contact_count || 0} ครั้ง</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">วันที่สร้าง</div>
                <div className="font-medium">{formatDate(listing.created_at)}</div>
              </div>
            </div>

            {listing.updated_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">อัพเดทล่าสุด</div>
                  <div className="font-medium">{formatDate(listing.updated_at)}</div>
                </div>
              </div>
            )}

            {listing.expires_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">วันหมดอายุ</div>
                  <div className="font-medium">{formatDate(listing.expires_at)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Coordinates */}
          {(listing.location_lat || listing.location_lng) && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">พิกัด</h3>
              <div className="text-sm space-y-1">
                {listing.location_lat && <div>ละติจูด: {listing.location_lat}</div>}
                {listing.location_lng && <div>ลองจิจูด: {listing.location_lng}</div>}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(listing.approved_by || listing.rejection_reason) && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">ข้อมูลการอนุมัติ</h3>
              {listing.approved_by && (
                <div className="text-sm">
                  อนุมัติโดย: {listing.approved_by} เมื่อ {formatDate(listing.approved_at)}
                </div>
              )}
              {listing.rejection_reason && (
                <div className="text-sm text-destructive">
                  เหตุผลที่ปฏิเสธ: {listing.rejection_reason}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>ปิด</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailModal;