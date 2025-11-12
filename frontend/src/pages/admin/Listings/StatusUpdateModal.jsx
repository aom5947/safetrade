// StatusUpdateModal.jsx
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/Admin_components/ui/dialog';
import { Button } from '@/components/Admin_components/ui/button';
import { Label } from '@/components/Admin_components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Admin_components/ui/select';
import { Badge } from '@/components/Admin_components/ui/badge';
import { getStatusColor, getStatusDisplayName } from '@/lib/utils';

const StatusUpdateModal = ({ isOpen, onClose, listing, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(listing?.status || '');
  const [loading, setLoading] = useState(false);

  if (!listing) return null;

  const statusOptions = [
    { value: 'active', label: 'Active - แสดงให้ผู้ซื้อเห็น', color: 'bg-green-500' },
    { value: 'sold', label: 'Sold - ขายแล้ว', color: 'bg-gray-500' },
    { value: 'expired', label: 'Expired - หมดอายุ', color: 'bg-red-500' },
    { value: 'hidden', label: 'Hidden - ซ่อนโดยผู้ขาย', color: 'bg-yellow-500' },
    { value: 'pending', label: 'Pending - รออนุมัติ', color: 'bg-blue-500' },
    { value: 'rejected', label: 'Rejected - ถูกปฏิเสธ', color: 'bg-red-500' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newStatus) {
      return;
    }

    if (newStatus === listing.status) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onUpdateStatus(listing.listing_id, newStatus);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เปลี่ยนสถานะประกาศ</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Listing Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium mb-1">{listing.title}</div>
            <div className="text-sm text-muted-foreground">
              สถานะปัจจุบัน:{' '}
              <Badge className={getStatusColor(listing.status)}>
                {getStatusDisplayName(listing.status)}
              </Badge>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label>สถานะใหม่</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Descriptions */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-blue-900 dark:text-blue-100">
              <div className="font-medium">คำอธิบายสถานะ:</div>
              <ul className="space-y-1 text-xs">
                <li><strong>Active:</strong> ประกาศจะแสดงให้ผู้ซื้อเห็นในหน้าค้นหา</li>
                <li><strong>Sold:</strong> ประกาศจะถูกทำเครื่องหมายว่าขายแล้ว</li>
                <li><strong>Expired:</strong> ประกาศหมดอายุแล้ว</li>
                <li><strong>Hidden:</strong> ผู้ขายซ่อนประกาศชั่วคราว</li>
                <li><strong>Pending:</strong> รอการอนุมัติจากแอดมิน</li>
                <li><strong>Rejected:</strong> ประกาศถูกปฏิเสธโดยแอดมิน</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading || !newStatus || newStatus === listing.status}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateModal;
