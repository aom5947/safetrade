// routes/uploadthingRouter.js
import { createRouteHandler } from "uploadthing/express";
import uploadRouter from "../libs/uploadthing.js";  // 👈 path ของคุณชัวร์ 100%

export const uploadthingHandler = createRouteHandler({
  router: uploadRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,   // 👈 สำคัญที่สุด
  },
});

export default uploadthingHandler;
