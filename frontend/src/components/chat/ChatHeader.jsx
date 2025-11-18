import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import ChatAvatar from "./ChatAvatar";
import { Button } from "@/components/Admin_components/ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/Admin_components/ui/alert-dialog";
import { api } from "@/services/api";
import { toast } from "sonner";



export default function ChatHeader({ conversation = {}, currentUserId }) {
    const [loading, setLoading] = useState(false);

    const isBuyer = currentUserId === conversation.buyer_id;
    const otherUser = {
        username: isBuyer ? conversation.seller_username : conversation.buyer_username,
        firstName: isBuyer ? conversation.seller_first_name : conversation.buyer_first_name,
        avatar: isBuyer ? conversation.seller_avatar : conversation.buyer_avatar,
    };

    const deleteConversation = async () => {
        const token = localStorage.getItem('token')
        if (!conversation?.conversation_id) return;
        try {
            setLoading(true);
            const res = await api.delete(`conversations/${conversation.conversation_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(res.data.message)
            window.location.reload();
        } catch (err) {
            console.error("Failed to delete conversation:", err);
            toast.error('Failed to delete conversation')
            // คุณอาจจะแสดง toast หรือ error state ที่นี่
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border-b p-4 flex justify-between items-center gap-3">
            <div className="flex items-center gap-3">
                <ChatAvatar username={otherUser.username} size="md" src={otherUser.avatar} />
                <div className="ml-2">
                    <p className="font-semibold text-gray-900">{otherUser.firstName || otherUser.username}</p>
                    <p className="text-xs text-gray-500">ติดต่อจาก {conversation?.listing_title}</p>
                </div>
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="ลบการสนทนา">
                        <Trash2 />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบการสนทนา</AlertDialogTitle>
                        <AlertDialogDescription>
                            การลบการสนทนานี้จะไม่สามารถกู้คืนได้
                            <br />
                            คุณแน่ใจหรือไม่ว่าต้องการลบการสนทนากับ <span className="font-medium">{otherUser.firstName || otherUser.username}</span>
                            {conversation?.listing_title ? (
                                <>
                                    {' '}
                                    สำหรับประกาศ <span className="font-medium">{conversation.listing_title}</span>
                                </>
                            ) : null}
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button variant="ghost">ยกเลิก</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button onClick={deleteConversation} disabled={loading}>
                                {loading ? "กำลังลบ..." : "ลบการสนทนา"}
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
