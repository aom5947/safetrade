import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/Admin_components/ui/dialog';
import { Button } from '@/components/Admin_components/ui/button';
import { Input } from '@/components/Admin_components/ui/input';
import { Label } from '@/components/Admin_components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/Admin_components/ui/select';
import { UserPlus } from 'lucide-react';
import { api } from '@/services/api';

const CreateUserDialog = ({ onUserCreated }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        first_name: '',
        last_name: '',
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password || !formData.username ||
            !formData.first_name || !formData.last_name) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                '/admin/users',
                {
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                },
                {
                    headers: {
                        Authorization: `Basic ${localStorage.getItem('token')}`,
                    },
                }
            );

            toast.success('สร้างผู้ใช้งานสำเร็จ');

            // Reset form
            setFormData({
                email: '',
                password: '',
                username: '',
                first_name: '',
                last_name: '',
            });

            setOpen(false);

            // Callback to refresh users list
            if (onUserCreated) {
                onUserCreated();
            }
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('ไม่สามารถสร้างผู้ใช้งานได้');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    สร้างผู้ใช้งาน
                </Button>
            </DialogTrigger>
            <DialogContent className="font-lineSeed max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>สร้างผู้ใช้งานใหม่</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">อีเมล *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">ชื่อผู้ใช้ *</Label>
                        <Input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            placeholder="username"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">ชื่อ *</Label>
                            <Input
                                id="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                placeholder="ชื่อ"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last_name">นามสกุล *</Label>
                            <Input
                                id="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                placeholder="นามสกุล"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">รหัสผ่าน *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="รหัสผ่าน"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'กำลังสร้าง...' : 'สร้างผู้ใช้งาน'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateUserDialog;