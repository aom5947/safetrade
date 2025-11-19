// ListingFormModal.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/Admin_components/ui/dialog';
import { Input } from '@/components/Admin_components/ui/input';
import { Button } from '@/components/Admin_components/ui/button';
import { Label } from '@/components/Admin_components/ui/label';
import { Textarea } from '@/components/Admin_components/ui/textarea';
import { ImageUploadDropzone } from '@/components/image-upload-dropzone';

const ListingFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  mode = 'create',
  initialData = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    price: '',
    location: '',
    locationLat: '',
    locationLng: '',
    expiresAt: '',
    images: [],
  });

  console.log(categories, "cat data");
  

  // ✅ เพิ่ม state สำหรับรูปที่อัปโหลดผ่าน UploadThing
  const [uploadedImages, setUploadedImages] = useState([]);
  // State สำหรับรูปที่ใส่ URL เอง
  const [manualImageUrls, setManualImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        categoryId: initialData.category_id?.toString() || '',
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        location: initialData.location || '',
        locationLat: initialData.location_lat?.toString() || '',
        locationLng: initialData.location_lng?.toString() || '',
        expiresAt: initialData.expires_at
          ? new Date(initialData.expires_at).toISOString().slice(0, 16)
          : '',
        images: [],
      });

      // Set existing images
      if (initialData.images && Array.isArray(initialData.images)) {
        setManualImageUrls(initialData.images.map((img) => img.image_url));
      }
    }
  }, [mode, initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Handle อัปโหลดรูปจาก UploadThing
  const handleUploadedImages = (images) => {
    setUploadedImages(images);
  };

  // Handle เพิ่มรูปจาก URL
  const handleAddManualImage = () => {
    if (!newImageUrl.trim()) {
      toast.error('กรุณาใส่ URL รูปภาพ');
      return;
    }

    // Validate URL format
    try {
      new URL(newImageUrl);
    } catch {
      toast.error('URL ไม่ถูกต้อง');
      return;
    }

    if (manualImageUrls.includes(newImageUrl)) {
      toast.error('รูปภาพนี้มีอยู่แล้ว');
      return;
    }

    setManualImageUrls((prev) => [...prev, newImageUrl]);
    setNewImageUrl('');
    toast.success('เพิ่มรูปภาพสำเร็จ');
  };

  // Handle ลบรูปจาก URL
  const handleRemoveManualImage = (index) => {
    setManualImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle ลบรูปจาก UploadThing
  const handleRemoveUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('กรุณาใส่ชื่อประกาศ');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('กรุณาใส่รายละเอียด');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('กรุณาใส่ราคาที่ถูกต้อง');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
      };

      // Optional fields
      if (formData.categoryId) {
        submitData.categoryId = parseInt(formData.categoryId);
      }
      if (formData.location) {
        submitData.location = formData.location;
      }
      if (formData.locationLat) {
        submitData.locationLat = parseFloat(formData.locationLat);
      }
      if (formData.locationLng) {
        submitData.locationLng = parseFloat(formData.locationLng);
      }
      if (formData.expiresAt) {
        submitData.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      // ✅ รวมรูปจากทั้งสองแหล่ง
      const allImages = [
        ...uploadedImages.map(img => img.url || img), // UploadThing images
        ...manualImageUrls // Manual URL images
      ];

      if (allImages.length > 0) {
        submitData.images = allImages;
      }

      await onSubmit(submitData);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  // ✅ รวมรูปทั้งหมดสำหรับแสดง preview
  const allImageUrls = [
    ...uploadedImages.map(img => img.url || img),
    ...manualImageUrls
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'สร้างประกาศใหม่' : 'แก้ไขประกาศ'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          {/* <div className="space-y-2">
            <Label htmlFor="category">หมวดหมู่</Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ไม่ระบุหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div> */}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">ชื่อประกาศ *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="เช่น iPhone 14 Pro Max 256GB"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="อธิบายรายละเอียดสินค้า..."
              rows={4}
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">ราคา (บาท) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">สถานที่</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="เช่น กรุงเทพมหานคร"
            />
          </div>

          {/* Coordinates */}
          {/* <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationLat">ละติจูด</Label>
              <Input
                id="locationLat"
                type="number"
                value={formData.locationLat}
                onChange={(e) => handleChange('locationLat', e.target.value)}
                placeholder="13.7563"
                step="any"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationLng">ลองจิจูด</Label>
              <Input
                id="locationLng"
                type="number"
                value={formData.locationLng}
                onChange={(e) => handleChange('locationLng', e.target.value)}
                placeholder="100.5018"
                step="any"
              />
            </div>
          </div> */}

          {/* Expires At */}
          {/* <div className="space-y-2">
            <Label htmlFor="expiresAt">วันหมดอายุ</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => handleChange('expiresAt', e.target.value)}
            />
          </div> */}

          {/* Images - ✅ แสดงทั้งสองแบบ */}
          <div className="space-y-4">
            <Label>รูปภาพ</Label>

            {/* ✅ Option 1: อัปโหลดผ่าน UploadThing */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImagePlus className="h-4 w-4" />
                <span>อัปโหลดรูปภาพ</span>
              </div>
              <ImageUploadDropzone
                maxImages={6}
                headerText="อัปโหลดรูปภาพสินค้า (สูงสุด 6 รูป)"
                onImagesChange={handleUploadedImages}
                onUploadError={(error) => {
                  toast.error(`เกิดข้อผิดพลาด: ${error}`);
                }}
              />
            </div>

            {/* ✅ Option 2: ใส่ URL เอง */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Upload className="h-4 w-4" />
                <span>หรือใส่ URL รูปภาพ</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManualImage();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddManualImage}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  เพิ่ม
                </Button>
              </div>
            </div>

            {/* ✅ Image Preview - แสดงรูปจากทั้งสองแหล่ง */}
            {allImageUrls.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  รูปภาพทั้งหมด ({allImageUrls.length} รูป)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* รูปจาก UploadThing */}
                  {uploadedImages.map((img, index) => (
                    <div key={`uploaded-${index}`} className="relative group">
                      <div className="absolute top-1 left-1 z-10">
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                          Upload
                        </span>
                      </div>
                      <img
                        src={img.url || img}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveUploadedImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* รูปจาก Manual URL */}
                  {manualImageUrls.map((url, index) => (
                    <div key={`manual-${index}`} className="relative group">
                      <div className="absolute top-1 left-1 z-10">
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                          URL
                        </span>
                      </div>
                      <img
                        src={url}
                        alt={`Manual ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveManualImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : mode === 'create' ? 'สร้างประกาศ' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ListingFormModal;