import { api } from "@/services/api"
import { useState } from "react"

const REPORT_REASONS = [
    { value: "เนื้อหาไม่เหมาะสม", label: "เนื้อหาไม่เหมาะสม" },
    { value: "หลอกลวง / โกง", label: "หลอกลวง / โกง" },
    { value: "สแปม / โฆษณา", label: "สแปม / โฆษณา" },
    { value: "ข้อมูลเท็จ", label: "ข้อมูลเท็จ" },
    { value: "ละเมิดลิขสิทธิ์", label: "ละเมิดลิขสิทธิ์" },
    { value: "อื่น ๆ", label: "อื่น ๆ" },
]

export default function ReportDropdown({
    reportedType,
    reportedId,
    onSuccess,
    onError,
    buttonText = "รายงาน",
    buttonClassName = "w-full py-3 rounded-lg bg-white border hover:bg-gray-50 font-semibold",
    dropdownClassName = "w-full py-3 rounded-lg border bg-white",
    submitButtonClassName = "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed",
}) {
    const [showDropdown, setShowDropdown] = useState(false)
    const [reportReason, setReportReason] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!reportReason) {
            alert("กรุณาเลือกเหตุผลในการรายงาน")
            return
        }

        try {
            setLoading(true)
            const reportData = {
                reportedType,
                reportedId,
                reason: reportReason,
            }

            const token = localStorage.getItem("token")
            const headers = token ? { Authorization: `Bearer ${token}` } : {}

            const response = await api.post("/reports", reportData, { headers })

            if (response.data.success) {
                alert("ส่งรายงานเรียบร้อยแล้ว ทีมงานจะตรวจสอบเร็วๆ นี้")
                setReportReason("")
                setShowDropdown(false)
                onSuccess?.()
            } else {
                const errorMessage = response.data.message || "เกิดข้อผิดพลาด"
                alert("เกิดข้อผิดพลาด: " + errorMessage)
                onError?.(errorMessage)
            }
        } catch (error) {
            console.error(error)
            const errorMessage = "ไม่สามารถส่งรายงานได้"
            alert(errorMessage)
            onError?.(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2 w-full max-w-md">
            {!showDropdown && (
                <button
                    onClick={() => setShowDropdown(true)}
                    className={buttonClassName}
                >
                    {buttonText}
                </button>
            )}

            {showDropdown && (
                <div className="flex flex-col gap-2">
                    <select
                        className={dropdownClassName}
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">-- เลือกเหตุผล --</option>
                        {REPORT_REASONS.map((reason) => (
                            <option key={reason.value} value={reason.value}>
                                {reason.label}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDropdown(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleSubmit}
                            className={submitButtonClassName}
                            disabled={loading}
                        >
                            {loading ? "กำลังส่ง..." : "ส่งรายงาน"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
