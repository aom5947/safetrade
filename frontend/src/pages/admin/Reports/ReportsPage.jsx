import React, { useState, useEffect } from 'react';
import { Flag, AlertCircle, Users, Package, Star } from 'lucide-react';
import { toast } from 'sonner';

// ✅ ui: ใช้ชื่อไฟล์ตัวเล็ก (card.jsx, button.jsx, badge.jsx, table.jsx, select.jsx)
import { Card, CardContent, CardHeader } from '@/components/Admin_components/ui/card';
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
import { Select } from '@/components/Admin_components/ui/select';

// ✅ Components ที่อยู่นอก ui
import { Loading } from '@/components/Admin_components/Loading';
import { EmptyState } from '@/components/Admin_components/EmptyState';

import { getStatusColor, getStatusDisplayName, formatDate } from '@/lib/utils';
import { api } from '@/services/api';
import { StatCard } from '../Dashboard/DashboardPage';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Admin_components/ui/dialog';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null)
  const [openId, setOpenId] = useState(null)

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data?.data);

      const responseStatistics = await api.get('/reports/statistics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(responseStatistics.data?.data);
      console.log(reports.report_id, "reports");
      
      setStats(responseStatistics.data?.data ?? null)
      setReports(response.data?.data ?? null)
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await api.patch(`/reports/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('อัพเดทสถานะสำเร็จ');
      fetchReports();
    } catch (error) {
      toast.error('ไม่สามารถอัพเดทได้');
    }
  };

  const fetchReportsDetail = async (id) => {
    try {
      // setLoading(true);
      const response = await api.get(`/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data?.data);

    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenChange = async (isOpen, id) => {
    if (isOpen) {
      // setLoading(true)
      try {
        const data = await fetchReportsDetail(id)
        setDetail(data)
        setOpenId(id)
      } finally {
        setLoading(false)
      }
    } else {
      setOpenId(null)
      setDetail(null)
    }
  }

  const getReportTypeLabel = (type) => {
    const types = {
      listing: 'ประกาศ',
      user: 'ผู้ใช้',
      review: 'รีวิว',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="ดำเนินการเสร็จสิ้น"
          value={loading ? 'กำลังโหลด...' : stats.listing_reports}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="รายงานประกาศ"
          value={loading ? 'กำลังโหลด...' : stats.listing_reports}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="รายงานรอตรวจสอบ"
          value={loading ? 'กำลังโหลด...' : stats.pending_count}
          icon={Flag}
          color="bg-orange-500"
        />
        <StatCard
          title="รวมรายงาน"
          value={loading ? 'กำลังโหลด...' : stats.total_reports}
          icon={Star}
          color="bg-yellow-500"
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold">จัดการรายงาน</h1>
        <p className="text-gray-500 mt-1">ตรวจสอบและจัดการรายงานจากผู้ใช้</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <Loading />
          ) : reports.length === 0 ? (
            <EmptyState icon={Flag} title="ไม่มีรายงาน" description="ยังไม่มีรายงานในระบบ" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>ผู้รายงาน</TableHead>
                  <TableHead>เหตุผล</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.report_id}>
                    <TableCell>
                      <Badge variant="secondary">{getReportTypeLabel(report.reported_type)}</Badge>
                    </TableCell>
                    <TableCell>{report.reporter_name || 'ผู้ใช้ทั่วไป'}</TableCell>
                    <TableCell className="max-w-md truncate">{report.reason}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusDisplayName(report.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={openId === report.report_id} onOpenChange={(isOpen) => handleOpenChange(isOpen, report.report_id)}>
                          <DialogTrigger asChild>
                            <Button type="button" size="sm">รายละเอียด</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold">
                                รายละเอียดการรายงาน #{report.report_id}
                              </DialogTitle>
                              <DialogDescription>
                                ข้อมูลการรายงานและรายละเอียดเนื้อหาที่ถูกรายงาน
                              </DialogDescription>
                            </DialogHeader>

                            <div className="font-sukhumvit space-y-6 py-4">
                              {/* Report Status */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-600">สถานะ:</span>
                                  <Badge className={getStatusColor(report.status)}>
                                    {getStatusDisplayName(report.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-600">ประเภท:</span>
                                  <Badge variant="secondary">{getReportTypeLabel(report.reported_type)}</Badge>
                                </div>
                              </div>

                              {/* <Separator /> */}

                              {/* Reporter Information */}
                              <div className="space-y-3">
                                <h3 className="font-semibold text-base">ข้อมูลผู้รายงาน</h3>
                                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">ชื่อผู้ใช้</p>
                                    <p className="text-sm font-medium">{report.reporter_username}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">อีเมล</p>
                                    <p className="text-sm font-medium">{report.reporter_email}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-xs text-gray-500 mb-1">วันที่รายงาน</p>
                                    <p className="text-sm font-medium">{formatDate(report.created_at)}</p>
                                  </div>
                                </div>
                              </div>

                              {/* <Separator /> */}

                              {/* Report Reason */}
                              <div className="space-y-2">
                                <h3 className="font-semibold text-base">เหตุผลในการรายงาน</h3>
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                  <p className="text-sm text-gray-700">{report.reason}</p>
                                </div>
                              </div>

                              {/* <Separator /> */}
                              {/* ทําต่อพ.น */}
                              {/* Item Details */}
                              {report.itemDetails && (
                                <div className="space-y-3">
                                  <h3 className="font-semibold text-base">รายละเอียดสินค้าที่ถูกรายงาน</h3>
                                  <div className="border rounded-lg p-4 space-y-3">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">ชื่อสินค้า</p>
                                      <p className="text-sm font-semibold">{report.itemDetails.title}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">คำอธิบาย</p>
                                      <p className="text-sm text-gray-700">{report.itemDetails.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">ราคา</p>
                                        <p className="text-sm font-semibold text-green-600">
                                          ฿{Number(report.itemDetails.price).toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">สถานะสินค้า</p>
                                        <Badge variant={report.itemDetails.status === 'active' ? 'default' : 'secondary'}>
                                          {report.itemDetails.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">ID สินค้า</p>
                                      <p className="text-sm font-mono text-gray-600">#{report.itemDetails.listing_id}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Resolution Information */}
                              {report.status !== 'pending' && (
                                <>
                                  {/* <Separator /> */}
                                  <div className="space-y-3">
                                    <h3 className="font-semibold text-base">ข้อมูลการจัดการ</h3>
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500">ดำเนินการโดย</p>
                                        <p className="text-sm font-medium">{report.resolved_by_username}</p>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500">วันที่ดำเนินการ</p>
                                        <p className="text-sm font-medium">{formatDate(report.resolved_at)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {report.status === 'pending' && (
                              <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  onClick={() => handleStatusUpdate('rejected')}
                                >
                                  ปฏิเสธ
                                </Button>
                                <Button
                                  onClick={() => handleStatusUpdate('resolved')}
                                >
                                  แก้ไขแล้ว
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {report.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(report.report_id, 'resolved')}
                            >
                              แก้ไขแล้ว
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(report.report_id, 'rejected')}
                            >
                              ปฏิเสธ
                            </Button>
                          </>
                        )}
                      </div>
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

export default ReportsPage;
