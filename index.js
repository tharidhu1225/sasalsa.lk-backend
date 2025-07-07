import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
import { connectCloudinary } from "./config/cloudinary.js";  // import here
import userRouter from "./routes/user.routes.js";
import adRouter from "./routes/ad.routes.js";
import adminRouter from "./routes/adminRouter.js";

dotenv.config();

const app = express();

// Connect to Cloudinary before starting server
await connectCloudinary();

// 🌐 Allow all origins
app.use(
  cors({
    origin: true, // Reflects the request origin
    credentials: true, // Allow cookies and auth headers
  })
);

// Middlewares
app.use(cookieParser());
app.use(express.json());

// API Endpoints
app.use("/api/user", userRouter);
app.use("/api/ad", adRouter);
app.use("/api/admin", adminRouter);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
