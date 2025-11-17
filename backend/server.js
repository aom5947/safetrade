import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
dotenv.config()

import { query } from "./src/libs/pool-query.js"

// import router
import userRouter from "./src/routes/userRouter.js"
import listingRouter from "./src/routes/listingRouter.js"
import categoryRouter from "./src/routes/categoryRouter.js"
import guestContactRouter from "./src/routes/guestContactRouter.js"
import savedListingRouter from "./src/routes/savedListingRouter.js"
import reviewRouter from "./src/routes/reviewRouter.js"
import reportRouter from "./src/routes/reportRouter.js"
import conversationRouter from "./src/routes/conversationRouter.js"
import adminRouter from "./src/routes/adminRouter.js"
import sellerRouter from "./src/routes/sellerRouter.js"
import uploadthingHandler from "./routes/uploadthingRouter.js";


// uploadthing
import uploadRouter from "./src/libs/uploadthing.js"
import { createRouteHandler } from "uploadthing/express"

const app = express()
const PORT = process.env.PORT
const HOST = process.env.HOST
const API_PREFIX = process.env.API_PREFIX

app.use(cors())
app.use(express.json())

// uploadimage route
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN,  // 👈 เปลี่ยนจาก uploadthingSecret เป็น token
      logLevel: "debug",                  // ถ้าอยากดู log เพิ่ม เปิดบรรทัดนี้ได้
    },
  }),
);

// main routes
app.use(`${API_PREFIX}/users`, userRouter)
app.use(`${API_PREFIX}/listings`, listingRouter)
app.use(`${API_PREFIX}/categories`, categoryRouter)
app.use(`${API_PREFIX}/guest-contacts`, guestContactRouter)
app.use(`${API_PREFIX}/saved-listings`, savedListingRouter)
app.use(`${API_PREFIX}/reviews`, reviewRouter)
app.use(`${API_PREFIX}/reports`, reportRouter)
app.use(`${API_PREFIX}/conversations`, conversationRouter)
app.use(`${API_PREFIX}/admin`, adminRouter)
app.use(`${API_PREFIX}/sellers`, sellerRouter)

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: 'C2C Marketplace API Server',
    version: '3.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: `${API_PREFIX}/users`,
      listings: `${API_PREFIX}/listings`,
      categories: `${API_PREFIX}/categories`,
      guestContacts: `${API_PREFIX}/guest-contacts`,
      savedListings: `${API_PREFIX}/saved-listings`,
      reviews: `${API_PREFIX}/reviews`,
      reports: `${API_PREFIX}/reports`,
      conversations: `${API_PREFIX}/conversations`,
      admin: `${API_PREFIX}/admin`,
      sellers: `${API_PREFIX}/sellers`,
      health: '/database/health'
    }
  })
})

// database
app.get('/database/health', async (req, res) => {
  try {
    const sql = 'SELECT * from t3gallery_image'
    const data = await query(sql)
    const check = data.rows

    res.status(200).json({ success: true, status: check });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://${HOST}:${PORT}`)
})