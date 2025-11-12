import React, { useEffect, useState } from "react"
import axios from "axios"
import { useForm } from "react-hook-form"
import { Card } from "@/components/Admin_components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Admin_components/ui/avatar"
import { Button } from "@/components/Admin_components/ui/button"
import { Badge } from "@/components/Admin_components/ui/badge"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/Admin_components/ui/dialog"
import { Input } from "@/components/Admin_components/ui/input"
import { Label } from "@/components/Admin_components/ui/label"

const API_URL = "https://your-api-url.com/api/profile" // เปลี่ยนเป็น API จริงของคุณ

const Profile = () => {
    const [profile, setProfile] = useState(null)
    const { register, handleSubmit, reset } = useForm()

    // ✅ โหลดข้อมูลจาก localStorage ก่อน แล้วค่อย fetch จาก API เพื่อ sync
    useEffect(() => {
        const localProfile = localStorage.getItem("userData")
        if (localProfile) {
            const parsed = JSON.parse(localProfile)
            console.log("Loaded user from localStorage:", parsed.user)
            setProfile(parsed.user)
            reset(parsed.user)
        }

        // const fetchProfile = async () => {
        //     try {
        //         const res = await axios.get(API_URL)
        //         setProfile(res.data)
        //         reset(res.data)
        //         localStorage.setItem("profile", JSON.stringify(res.data))
        //     } catch (err) {
        //         console.error("Error fetching profile:", err)
        //     }
        // }

        // fetchProfile()
    }, [reset])

    const onSubmit = async (data) => {
        try {
            const res = await axios.put(API_URL, data, {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("userData")).token}`
                }
            })

            const updatedProfile = res.data.user || res.data
            setProfile(updatedProfile)

            // อัปเดต localStorage ทั้ง object เดิม แต่เปลี่ยนเฉพาะ user
            const existing = JSON.parse(localStorage.getItem("userData"))
            existing.user = updatedProfile
            localStorage.setItem("userData", JSON.stringify(existing))

            alert("✅ Profile updated successfully!")
        } catch (err) {
            console.error("Error updating profile:", err)
            alert("❌ Failed to update profile.")
        }
    }

    if (!profile) return <p className="text-center mt-10">Loading...</p>

    return (
        <Card className="mx-auto w-[80%] p-8">
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">
                        {profile.first_name?.[0]}
                        {profile.last_name?.[0]}
                    </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-semibold text-foreground">
                    {profile.first_name} {profile.last_name}
                </h2>
                <Badge variant="secondary" className="font-medium">
                    userId: {profile.user_id}
                </Badge>


                {/* 🧾 ข้อมูลโปรไฟล์ */}
                <div className="w-full space-y-3 border-t pt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Firstname</span>
                        <span className="font-medium">{profile.first_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lastname</span>
                        <span className="font-medium">{profile.last_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{profile.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{profile.email}</span>
                    </div>
                </div>

                {/* 🧩 Dialog สำหรับแก้ไข */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full mt-4">Edit Profile</Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <DialogHeader>
                                <DialogTitle>Edit profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click save when you're
                                    done.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstname">Firstname</Label>
                                    <Input id="firstname" {...register("first_name")} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastname">Lastname</Label>
                                    <Input id="lastname" {...register("last_name")} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" {...register("phone")} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" {...register("email")} />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </Card>
    )
}

export default Profile
