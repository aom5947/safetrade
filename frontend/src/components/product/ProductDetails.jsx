import React, { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/Admin_components/ui/Button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/Admin_components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/Admin_components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/Admin_components/ui/select";
import { Input } from "@/components/Admin_components/ui/input";
import { Label } from "@/components/Admin_components/ui/label";
import { Textarea } from "@/components/Admin_components/ui/textarea";
import { toast } from "sonner";

const statusOptions = [
    { value: "active", label: "แสดงให้ผู้ซื้อเห็น", color: "bg-green-500" },
    { value: "sold", label: "ขายแล้ว", color: "bg-gray-500" },
    { value: "expired", label: "หมดอายุ", color: "bg-red-500" },
    { value: "hidden", label: "ถูกซ่อน", color: "bg-yellow-500" },
    { value: "pending", label: "รออนุมัติ", color: "bg-blue-500" },
    { value: "rejected", label: "ถูกปฏิเสธ", color: "bg-red-500" },
];

export default function ProductDetails({ product, priceText, refetch, categories = [] }) {
    const status = statusOptions.find((opt) => opt.value === product.status);
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("token");

    const [selectedStatus, setSelectedStatus] = useState(product.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    // State สำหรับฟอร์มแก้ไข
    const [editForm, setEditForm] = useState({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        location: product.location || "",
        locationLat: product.location_lat || "",
        locationLng: product.location_lng || "",
        categoryId: product.category_id || "",
    });

    // Reset form เมื่อเปิด dialog
    const handleOpenEditDialog = () => {
        setEditForm({
            title: product.title || "",
            description: product.description || "",
            price: product.price || "",
            location: product.location || "",
            locationLat: product.location_lat || "",
            locationLng: product.location_lng || "",
            categoryId: product.category_id || "",
        });
        setShowEditDialog(true);
    };

    // 🧩 ฟังก์ชันแก้ไขสินค้า
    const updateProduct = async () => {
        // Validate
        if (!editForm.title.trim()) {
            toast.error("กรุณากรอกชื่อสินค้า");
            return;
        }
        if (!editForm.price || editForm.price < 0) {
            toast.error("กรุณากรอกราคาที่ถูกต้อง");
            return;
        }

        setIsUpdating(true);
        try {
            const res = await api.put(
                `/listings/${product.listing_id}`,
                {
                    title: editForm.title,
                    description: editForm.description,
                    price: parseFloat(editForm.price),
                    location: editForm.location,
                    locationLat: editForm.locationLat ? parseFloat(editForm.locationLat) : undefined,
                    locationLng: editForm.locationLng ? parseFloat(editForm.locationLng) : undefined,
                    categoryId: editForm.categoryId ? parseInt(editForm.categoryId) : undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("แก้ไขสินค้าสำเร็จ");
            console.log(res.data);

            // 🔄 โหลดข้อมูลใหม่จากเซิร์ฟเวอร์ทันที
            if (refetch) await refetch();

            // ปิด Dialog
            setShowEditDialog(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขสินค้า");
        } finally {
            setIsUpdating(false);
        }
    };

    // 🧩 ฟังก์ชันลบสินค้า
    const deleteProduct = async () => {
        setIsDeleting(true);
        try {
            const res = await api.delete(`/listings/${product.listing_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("ลบสินค้าสำเร็จ");
            console.log(res.data);

            // 🔄 โหลดข้อมูลใหม่จากเซิร์ฟเวอร์ทันที
            if (refetch) await refetch();

            // ปิด Dialog
            setShowDeleteDialog(false);
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการลบสินค้า");
        } finally {
            setIsDeleting(false);
        }
    };

    // 🧩 ฟังก์ชันเปลี่ยนสถานะสินค้า
    const changeProductStatus = async () => {
        setIsUpdating(true);
        try {
            const res = await api.patch(
                `/listings/${product.listing_id}/status`,
                { status: selectedStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("เปลี่ยนสถานะสำเร็จ");
            console.log(res.data);

            // 🔄 โหลดข้อมูลใหม่จากเซิร์ฟเวอร์ทันที
            if (refetch) await refetch();
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะสินค้า");
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="mt-6">
            {/* หัวข้อสินค้า */}
            <div>
                <h2 className="text-2xl font-bold">{product.title}</h2>
                <p className="text-3xl font-bold text-blue-600 my-2">
                    ฿ {Number(priceText).toLocaleString()}
                </p>
            </div>

            {/* แสดงสถานะปัจจุบัน */}
            <h2
                className={`mt-4 w-fit font-bold px-2 py-1 rounded-md text-white transition-all duration-300 ${
                    status?.color || "bg-gray-300"
                }`}
            >
                สถานะสินค้า: {status?.label || "ไม่ทราบสถานะ"}
            </h2>

            {status.value !== "pending" && status.value !== "sold" && role === "seller" && (
                <div className="flex flex-col gap-3 mt-3">
                    <div className="flex gap-y-2 flex-col md:flex-row md:items-center md:gap-2">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="border rounded-md px-3 py-2"
                            disabled={isUpdating}
                        >
                            <option value="active">แสดงให้ผู้ซื้อเห็น</option>
                            <option value="sold">ขายแล้ว</option>
                            <option value="hidden">ซ่อนประกาศ</option>
                        </select>

                        <Button
                            onClick={changeProductStatus}
                            disabled={isUpdating}
                            className={`bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 ${
                                isUpdating ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {isUpdating ? "กำลังอัปเดต..." : "เปลี่ยนสถานะสินค้า"}
                        </Button>

                        <Button
                            onClick={handleOpenEditDialog}
                            className="bg-blue-500 text-white px-4 py-2 w-full md:w-fit rounded-md hover:bg-blue-600"
                        >
                            แก้ไขสินค้า
                        </Button>

                        <Button
                            onClick={() => setShowDeleteDialog(true)}
                            className="bg-red-500 text-white px-4 py-2 w-full md:w-fit rounded-md hover:bg-red-600"
                        >
                            ลบสินค้า
                        </Button>
                    </div>
                </div>
            )}

            {/* รายละเอียดสินค้า */}
            {product.description && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">รายละเอียด</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>
            )}

            {/* Dialog แก้ไขสินค้า */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="font-lineSeed max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>แก้ไขสินค้า</DialogTitle>
                        <DialogDescription>
                            แก้ไขข้อมูลสินค้าของคุณ กรุณากรอกข้อมูลให้ครบถ้วน
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* ชื่อสินค้า */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                ชื่อสินค้า <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={editForm.title}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, title: e.target.value })
                                }
                                placeholder="กรอกชื่อสินค้า"
                            />
                        </div>

                        {/* ราคา */}
                        <div className="grid gap-2">
                            <Label htmlFor="price">
                                ราคา (บาท) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, price: e.target.value })
                                }
                                placeholder="กรอกราคา"
                            />
                        </div>

                        {/* หมวดหมู่ */}
                        {categories.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="category">หมวดหมู่</Label>
                                <Select
                                    value={editForm.categoryId?.toString()}
                                    onValueChange={(value) =>
                                        setEditForm({ ...editForm, categoryId: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกหมวดหมู่" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* สถานที่ */}
                        <div className="grid gap-2">
                            <Label htmlFor="location">สถานที่</Label>
                            <Input
                                id="location"
                                value={editForm.location}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, location: e.target.value })
                                }
                                placeholder="กรอกสถานที่"
                            />
                        </div>

                        {/* พิกัด Latitude */}
                        <div className="grid gap-2">
                            <Label htmlFor="locationLat">Latitude (ละติจูด)</Label>
                            <Input
                                id="locationLat"
                                type="number"
                                step="any"
                                value={editForm.locationLat}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, locationLat: e.target.value })
                                }
                                placeholder="เช่น 13.7563"
                            />
                        </div>

                        {/* พิกัด Longitude */}
                        <div className="grid gap-2">
                            <Label htmlFor="locationLng">Longitude (ลองจิจูด)</Label>
                            <Input
                                id="locationLng"
                                type="number"
                                step="any"
                                value={editForm.locationLng}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, locationLng: e.target.value })
                                }
                                placeholder="เช่น 100.5018"
                            />
                        </div>

                        {/* รายละเอียด */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">รายละเอียด</Label>
                            <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, description: e.target.value })
                                }
                                placeholder="กรอกรายละเอียดสินค้า"
                                rows={5}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                            disabled={isUpdating}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="button"
                            onClick={updateProduct}
                            disabled={isUpdating}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            {isUpdating ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog ยืนยันการลบ */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="font-lineSeed">
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณแน่ใจหรือไม่ที่จะลบสินค้า "{product.title}"? การกระทำนี้ไม่สามารถยกเลิกได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteProduct}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}