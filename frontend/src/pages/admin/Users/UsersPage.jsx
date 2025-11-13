import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

// ✅ UI: ใช้ตัวเล็กทั้งหมดให้ตรงกับไฟล์จริงใน Admin_components/ui
import { Card, CardContent, CardHeader } from '@/components/Admin_components/ui/card';
import { Input } from '@/components/Admin_components/ui/input';
import { Button } from '@/components/Admin_components/ui/button';
import { Badge } from '@/components/Admin_components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Admin_components/ui/table';
import Loading from '@/components/Admin_components/ui/loading';

// ✅ EmptyState อยู่ใน common (เหมือนหน้าอื่น ๆ)
import { EmptyState } from '@/components/common/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Admin_components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Admin_components/ui/dialog"

// import userService from '../../services/userService';
import { getRoleColor, getRoleDisplayName, getStatusColor, getStatusDisplayName } from '@/lib/utils';
import { api } from '@/services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');


  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search); // อัปเดต debouncedSearch เมื่อผู้ใช้พิมพ์เสร็จ
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = debouncedSearch ? { search: debouncedSearch } : {};

      console.log(params);

      const response = await api.get('/admin/getalluser', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params
      });

      console.log(response.data?.users);

      setUsers(response.data?.users || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่?')) return;
    try {
      await userService.deleteUser(id);
      toast.success('ลบสำเร็จ');
      fetchUsers();
    } catch (error) {
      toast.error('ไม่สามารถลบได้');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {

    try {
      const response = await api.put(
        "/admin/updateuserstatus",
        {
          userId: userId,
          newStatus: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('เปลี่ยนสถานะสำเร็จ');
      console.log("Status updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized - Check token or authentication");
      }
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน</h1>
        <p className="text-gray-500 mt-1">ดูและจัดการผู้ใช้งานในระบบ</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อ, อีเมล, หรือ ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchUsers}>ค้นหา</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading />
          ) : users.length === 0 ? (
            <EmptyState title="ไม่พบผู้ใช้งาน" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>user_id</TableHead>
                  <TableHead>ชื่อ-นามสุกล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      {user.user_id}
                    </TableCell>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant='default' className={getRoleColor(user.user_role)}>
                        {getRoleDisplayName(user.user_role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='default' className={getStatusColor(user.status)}>
                        {getStatusDisplayName(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center justify-end space-x-2">
                      {user.user_role === "super_admin" && (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(user.user_id)}
                          >
                            ลบ
                          </Button>
                          <Select onValueChange={(newStatus) => handleStatusChange(user.user_id, newStatus)}>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder={user.user_role} />
                            </SelectTrigger>
                            <SelectContent className="">
                              <SelectItem value="buyer">Buyer</SelectItem>
                              <SelectItem value="seller">Seller</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      <Select onValueChange={(newStatus) => handleStatusChange(user.user_id, newStatus)}>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder={user.status} />
                        </SelectTrigger>
                        <SelectContent className="">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                      </Select>
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

export default UsersPage;
