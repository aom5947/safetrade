import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

// ✅ ใช้ path ตรงกับของจริง (ทั้งหมดใน Admin_components/ui)
import { Card, CardContent, CardHeader } from '@/components/Admin_components/ui/card';
import { Button } from '@/components/Admin_components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Admin_components/ui/table';
import { Loading } from '@/components/Admin_components/ui/loading'; // 👈 แก้ให้ชื่อไฟล์เป็นตัวเล็กทั้งหมด

// ✅ แก้ path common ให้ใช้ @ หรือ ../../ แล้วแต่ที่ตั้งจริง
import { EmptyState } from '@/components/common/EmptyState';
import reviewService from '@/services/reviewService';



const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAllReviews();
      setReviews(response.data?.reviews || []);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่?')) return;
    try {
      await reviewService.deleteReview(id);
      toast.success('ลบรีวิวสำเร็จ');
      fetchReviews();
    } catch (error) {
      toast.error('ไม่สามารถลบได้');
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการรีวิว</h1>
        <p className="text-gray-500 mt-1">ดูและจัดการรีวิวจากผู้ใช้งาน</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <Loading />
          ) : reviews.length === 0 ? (
            <EmptyState icon={Star} title="ไม่มีรีวิว" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้รีวิว</TableHead>
                  <TableHead>ผู้ถูกรีวิว</TableHead>
                  <TableHead>คะแนน</TableHead>
                  <TableHead>ความคิดเห็น</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.review_id}>
                    <TableCell>{review.reviewer_name || 'ไม่ระบุ'}</TableCell>
                    <TableCell>{review.seller_name || 'ไม่ระบุ'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">({review.rating})</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{review.comment || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(review.review_id)}
                      >
                        ลบ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsPage;
