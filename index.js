import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
import { connectCloudinary } from "./config/cloudinary.js";
import userRouter from "./routes/user.routes.js";
import adRouter from "./routes/ad.routes.js";
import adminRouter from "./routes/adminRouter.js";

import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import Ad from "./models/ad.model.js"; // 🔁 Import Ad model

dotenv.config();

const app = express();

await connectCloudinary();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/ad", adRouter);
app.use("/api/admin", adminRouter);

// ✅ Sitemap route
app.get("/sitemap.xml", async (req, res) => {
  try {
    res.header("Content-Type", "application/xml");
    const stream = new SitemapStream({ hostname: "https://sasala.vercel.app" });

    // 🔹 Static links
    const staticLinks = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/login", changefreq: "yearly", priority: 0.2 },
      { url: "/register", changefreq: "yearly", priority: 0.2 },  
    ];

    // 🔹 Dynamic ad links using /ad/:id
    const ads = await Ad.find().select("_id updatedAt");
    const adLinks = ads.map((ad) => ({
      url: `/ad/${ad._id}`, // 🟢 use MongoDB _id directly
      changefreq: "weekly",
      priority: 0.8,
      lastmod: ad.updatedAt?.toISOString(),
    }));

    const links = [...staticLinks, ...adLinks];

    const xml = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
      data.toString()
    );

    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).end();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
