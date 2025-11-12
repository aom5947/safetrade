import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 8 },
  }).onUploadComplete(async ({ metadata, file }) => {
    // ใช้ destructure เพื่อให้ `file` มีอยู่จริง
    console.log("################ 200 succ....");
    console.log("upload completed", { metadata, file });
    // เก็บลง DB ถ้าต้องการ (await ... )
    return { fileUrl: file.ufsUrl }; // ส่งกลับให้ client ได้ `fileUrl`
  }),
};

export default uploadRouter;
