// adminRouter.js
import express from "express";
import {
  approveAd,
  getDashboardStats,
  getUnapprovedAds,
} from "../controller/adminController.js";
import verifyToken from "../middlewares/auth.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard-stats", verifyToken,  getDashboardStats);
adminRouter.get("/ads", verifyToken,  getUnapprovedAds);
adminRouter.patch("/ads/:id/approve", verifyToken,  approveAd);

export default adminRouter;
