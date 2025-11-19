import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/Admin_components/ui/alert-dialog"
import { Button } from "@/components/Admin_components/ui/button"
import { Trash2 } from "lucide-react"
import { api } from "@/services/api"
import { toast } from "sonner"

const DeleteUserDialog = ({ user, onUserDeleted }) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const { data } = await api.delete(`/admin/users/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      if (data.success) {
        onUserDeleted(user.user_id)
        toast.success(data.message)
      } else {
        toast.error(data.message)
        alert(data.message || "เกิดข้อผิดพลาดในการลบผู้ใช้")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      const errorMessage = error.response?.data?.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์"
      toast.error(errorMessage)
      // alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="h-4 w-4 mr-1" />
          ลบ
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='font-lineSeed'>
        <AlertDialogHeader>
          <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div className="grid gap-2">
              <span>การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
              <span className="font-semibold text-foreground">
                คุณกำลังจะลบผู้ใช้: <span className="text-destructive">{user.username}</span>
              </span>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <span>• ชื่อ: {user.first_name}-{user.last_name}</span>
                <span>• อีเมล: {user.email}</span>
                <span>• บทบาท: {user.user_role}</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "กำลังลบ..." : "ลบผู้ใช้"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteUserDialog