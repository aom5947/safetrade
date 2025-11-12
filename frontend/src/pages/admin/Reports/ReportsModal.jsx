import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/Admin_components/ui/dialog"

const ReportsModal = ({
    report,
    openId,
    onOpenChange,
    onUpdateStatus,
    getStatusColor,
    getStatusDisplayName,
    getReportTypeLabel,
    formatDate
}) => {
    return (
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

                <div className="space-y-6 py-4">
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

                    <Separator />

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

                    <Separator />

                    {/* Report Reason */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">เหตุผลในการรายงาน</h3>
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">{report.reason}</p>
                        </div>
                    </div>

                    <Separator />

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
                            <Separator />
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
            </DialogContent>
        </Dialog>
    )
}
export default ReportsModal