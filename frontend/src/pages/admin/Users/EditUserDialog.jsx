import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/Admin_components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/Admin_components/ui/select"
import { Button } from "@/components/Admin_components/ui/button"
import { Input } from "@/components/Admin_components/ui/input"
import { Label } from "@/components/Admin_components/ui/label"
import { Pencil } from "lucide-react"
import { api } from "@/services/api"
import { toast } from "sonner"

const EditUserDialog = ({ user, onUserUpdated }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: user.username || "",
        email: user.email || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        phone: user.phone || "",
        avatarUrl: user.avatar_url || "",
        status: user.status || "active",
        userRole: user.user_role || "buyer",
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await api.put(
                `/admin/users/${user.user_id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            console.log(formData);


            const data = await response.data

            if (data.success) {
                // เรียก callback เพื่ออัพเดทข้อมูลในตาราง
                onUserUpdated(data.user)
                setOpen(false)

                // แสดง notification (ถ้ามี)
                toast.success(data.message)
                // alert(data.message || "อัพเดทข้อมูลสำเร็จ")
            } else {
                toast.info(data.message)
                alert(data.message || "เกิดข้อผิดพลาด")
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;      // อาจเป็น string หรือ object
                const message =
                    typeof data === "string"
                        ? data
                        : data?.message || "เกิดข้อผิดพลาด";

                // ดักเฉพาะข้อความนี้
                if (
                    status === 400 &&
                    message.includes("Only super admin can set user role to admin")
                ) {
                    toast.error("เฉพาะ Super Admin เท่านั้นที่สามารถตั้งสิทธิ์เป็น Admin ได้");
                    return;
                }

                toast.error(message);
                console.error("Server Error:", error.response);
            } else {
                toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
                console.error("Network Error:", error);
            }
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4 mr-1" />
                    แก้ไข
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
                    <DialogDescription>
                        แก้ไขข้อมูลผู้ใช้ ID: {user.user_id}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Username */}
                        <div className="grid gap-2">
                            <Label htmlFor="username">ชื่อผู้ใช้</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                                placeholder="กรอกชื่อผู้ใช้"
                            />
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="กรอกอีเมล"
                            />
                        </div>

                        {/* First Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">ชื่อจริง</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                placeholder="กรอกชื่อจริง"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">นามสกุล</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                placeholder="กรอกนามสกุล"
                            />
                        </div>

                        {/* Phone */}
                        <div className="grid gap-2">
                            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="กรอกเบอร์โทรศัพท์"
                            />
                        </div>

                        {/* Avatar URL */}
                        <div className="grid gap-2">
                            <Label htmlFor="avatarUrl">URL รูปโปรไฟล์</Label>
                            <Input
                                id="avatarUrl"
                                value={formData.avatarUrl}
                                onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
                                placeholder="กรอก URL รูปโปรไฟล์"
                            />
                        </div>

                        {/* User Role */}
                        <div className="grid gap-2">
                            <Label htmlFor="userRole">บทบาท</Label>
                            <Select
                                value={formData.userRole}
                                onValueChange={(value) => handleInputChange("userRole", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกบทบาท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="buyer">Buyer</SelectItem>
                                    <SelectItem value="seller">Seller</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="grid gap-2">
                            <Label htmlFor="status">สถานะ</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกสถานะ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditUserDialog