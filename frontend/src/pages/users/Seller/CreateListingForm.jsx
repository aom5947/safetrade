import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/Admin_components/ui/button"
import { Input } from "@/components/Admin_components/ui/input"
import { Label } from "@/components/Admin_components/ui/label"
import { Textarea } from "@/components/Admin_components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Admin_components/ui/select"
import { Alert, AlertDescription } from "@/components/Admin_components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Admin_components/ui/card"
import { ImageUploadDropzone } from "@/components/image-upload-dropzone"
import { thaiProvinces } from "@/lib/utils"
import { api } from "@/services/api"

const CreateListingForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm()

    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [selectedParentCategory, setSelectedParentCategory] = useState(null)
    const [provinces, setProvinces] = useState([])
    const [uploadedImages, setUploadedImages] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(`/categories`)
                if (response.data.success) {
                    setCategories(response.data.categories || [])
                }
            } catch (error) {
                console.error("Error fetching categories:", error)
            }
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!selectedParentCategory) {
                setSubcategories([])
                return
            }

            try {
                const response = await api.get(`/categories`);
                if (response.data.success) {
                    const allCategories = response.data.categories || [];
                    let subs = [];

                    // หาหมวดที่ตรงกับ parent ที่เลือก
                    const parent = allCategories.find(
                        (cat) => cat.category_id === Number.parseInt(selectedParentCategory)
                    );

                    if (parent && parent.subcategories) {
                        subs = parent.subcategories;
                    }

                    console.log("adasd", subs, selectedParentCategory);
                    setSubcategories(subs);
                }
            } catch (error) {
                console.error("Error fetching subcategories:", error);
                setSubcategories([]);
            }
        }

        fetchSubcategories()
    }, [selectedParentCategory])


    useEffect(() => {
        setProvinces(thaiProvinces)
    }, [])

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true)
            setSubmitStatus(null)

            if (uploadedImages.length === 0) {
                setSubmitStatus({
                    type: "error",
                    message: "กรุณาใส่รูปภาพสินค้าอย่างน้อย 1 รูป",
                })
                setIsSubmitting(false)
                return
            }

            const token = localStorage.getItem("token")

            if (!token) {
                setSubmitStatus({
                    type: "error",
                    message: "กรุณาเข้าสู่ระบบก่อนสร้างประกาศ",
                })
                setIsSubmitting(false)
                return
            }

            const listingData = {
                categoryId: Number.parseInt(data.categoryId),
                title: data.title,
                description: data.description || "",
                price: Number(data.price),
                location: data.location,
                images: uploadedImages,
                phone: data.phone,
            }

            const response = await api.post(`/listings`, listingData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            console.log(listingData);
            

            if (response.data.success) {
                setSubmitStatus({
                    type: "success",
                    message: "สร้างประกาศสำเร็จ!",
                })

                setTimeout(() => {
                    window.location.href = `/product/${response.data.listingId}`
                }, 2000)
            }
        } catch (error) {
            console.error("Error creating listing:", error)
            setSubmitStatus({
                type: "error",
                message: error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างประกาศ",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">สร้างประกาศขายสินค้า</CardTitle>
                    <CardDescription>กรอกข้อมูลสินค้าของคุณให้ครบถ้วน</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* หัวข้อสินค้า */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                หัวข้อสินค้าที่คุณต้องการขาย <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="ของสินค้า เช่น โตโบพิ X 64GB สภาพเหมือนใหม่"
                                {...register("title", {
                                    required: "กรุณาระบุหัวข้อสินค้า",
                                    minLength: {
                                        value: 5,
                                        message: "หัวข้อต้องมีความยาวอย่างน้อย 5 ตัวอักษร",
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: "หัวข้อต้องมีความยาวไม่เกิน 100 ตัวอักษร",
                                    },
                                })}
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                            <p className="text-xs text-muted-foreground">หัวข้อสินค้าที่ชัดเจน ไม่มีเครื่องหมายพิเศษ เพิ่มโอกาสในการค้นหา</p>
                        </div>

                        {/* เลือกหมวดหมู่หลัก */}
                        <div className="space-y-2">
                            <Label htmlFor="parentCategory">
                                เลือกหมวดหมู่หลัก <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    setSelectedParentCategory(value)
                                    setValue("categoryId", "")
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกหมวดหมู่หลัก" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.category_id} value={category.category_id.toString()}>
                                            {category.icon} {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* เลือกหมวดหมู่ย่อย */}
                        {selectedParentCategory && subcategories.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">
                                    เลือกหมวดหมู่ย่อย <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={(value) => setValue("categoryId", value)}>
                                    <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                                        <SelectValue placeholder="เลือกหมวดหมู่ย่อย" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subcategories.map((subcat) => (
                                            <SelectItem key={subcat.category_id} value={subcat.category_id.toString()}>
                                                {subcat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" {...register("categoryId", { required: "กรุณาเลือกหมวดหมู่ย่อย" })} />
                                {errors.categoryId && <p className="text-sm text-red-500">กรุณาเลือกหมวดหมู่ย่อย</p>}
                            </div>
                        )}

                        {/* Alert when parent category has no subcategories */}
                        {selectedParentCategory && subcategories.length === 0 && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>หมวดหมู่นี้ยังไม่มีหมวดย่อย กรุณาเลือกหมวดหมู่อื่น</AlertDescription>
                            </Alert>
                        )}

                        {/* ระบุราคา */}
                        <div className="space-y-2">
                            <Label htmlFor="price">
                                ระบุราคา (บาท) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                placeholder="ระบุราคาเต็มของสินค้าหรือบริการ"
                                {...register("price", {
                                    required: "กรุณาระบุราคา",
                                    min: {
                                        value: 0,
                                        message: "ราคาต้องมากกว่าหรือเท่ากับ 0",
                                    },
                                })}
                                className={errors.price ? "border-red-500" : ""}
                            />
                            {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                        </div>

                        {/* รูปภาพสินค้า - UploadThing */}
                        <div className="space-y-2">
                            <Label>
                                รูปภาพสินค้า <span className="text-red-500">*</span>
                            </Label>

                            {/* UploadThing Dropzone */}
                            <ImageUploadDropzone
                                maxImages={18}
                                onImagesChange={(images) => {
                                    setUploadedImages(images)
                                }}
                                onUploadError={(error) => {
                                    setSubmitStatus({
                                        type: "error",
                                        message: `เกิดข้อผิดพลาด: ${error}`,
                                    })
                                }}
                            />

                            <p className="text-xs text-muted-foreground">กรุณาใส่รูปภาพสินค้าอย่างน้อย 1 รูป (สูงสุด 18 รูป)</p>
                        </div>

                        {/* รายละเอียดสินค้า */}
                        <div className="space-y-2">
                            <Label htmlFor="description">รายละเอียดสินค้า</Label>
                            <Textarea
                                id="description"
                                rows={5}
                                placeholder="ช่องเพิ่มเติม เช่น สภาพสินค้า สี อายุการใช้งาน ระบุประกัน"
                                {...register("description")}
                            />
                        </div>

                        {/* ระบุพื้นที่ */}
                        <div className="space-y-2">
                            <Label htmlFor="location">
                                ระบุพื้นที่ของสินค้า <span className="text-red-500">*</span>
                            </Label>
                            <Select onValueChange={(value) => setValue("location", value)}>
                                <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                                    <SelectValue placeholder="เลือกจังหวัด" />
                                </SelectTrigger>
                                <SelectContent>
                                    {provinces.map((province) => (
                                        <SelectItem key={province} value={province}>
                                            {province}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <input type="hidden" {...register("location", { required: "กรุณาเลือกพื้นที่" })} />
                            {errors.location && <p className="text-sm text-red-500">กรุณาเลือกจังหวัด</p>}
                        </div>

                        {/* เบอร์โทรศัพท์ */}
                        {/* <div className="space-y-2">
                            <Label htmlFor="phone">
                                เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="เช่น 0812345678"
                                {...register("phone", {
                                    required: "กรุณาระบุเบอร์โทรศัพท์",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก",
                                    },
                                })}
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                            <p className="text-xs text-muted-foreground">กรุณาใส่เบอร์โทรที่สามารถติดต่อได้ เพื่อความสะดวกในการซื้อขาย</p>
                        </div> */}

                        {/* ข้อความเงื่อนไข */}
                        <div className="text-center text-sm text-muted-foreground border-t pt-4">
                            คลิกปุ่ม "สร้างประกาศ" เพื่อยอมรับ{" "}
                            <a href="/terms" className="text-primary underline hover:text-primary/80">
                                ข้อกำหนดและเงื่อนไขการใช้งาน
                            </a>
                        </div>

                        {/* Status Message */}
                        {submitStatus && (
                            <Alert variant={submitStatus.type === "success" ? "default" : "destructive"}>
                                {submitStatus.type === "success" ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <AlertDescription>{submitStatus.message}</AlertDescription>
                            </Alert>
                        )}

                        {/* ปุ่มส่ง */}
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="w-full" size="lg">
                            {isSubmitting ? "กำลังสร้างประกาศ..." : "สร้างประกาศ"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateListingForm
