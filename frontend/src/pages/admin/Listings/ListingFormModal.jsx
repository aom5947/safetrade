// ListingFormModal.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Admin_components/ui/select';

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

  const [imageUrls, setImageUrls] = useState([]);
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
        setImageUrls(initialData.images.map((img) => img.image_url));
      }
    }
  }, [mode, initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
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

    if (imageUrls.includes(newImageUrl)) {
      toast.error('รูปภาพนี้มีอยู่แล้ว');
      return;
    }

    setImageUrls((prev) => [...prev, newImageUrl]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
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
      if (imageUrls.length > 0) {
        submitData.images = imageUrls;
      }

      await onSubmit(submitData);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

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
          <div className="space-y-2">
            <Label>หมวดหมู่</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ไม่ระบุหมวดหมู่</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Expires At */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">วันหมดอายุ</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => handleChange('expiresAt', e.target.value)}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>รูปภาพ</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://uploadthing.com/f/abc123.jpg"
              />
              <Button type="button" onClick={handleAddImage} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                เพิ่ม
              </Button>
            </div>

            {/* Image Preview */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
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
