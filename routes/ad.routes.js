import express from "express";
import { upload } from "../config/multer.js";
import verifyToken from "../middlewares/auth.js";
import {
  createAd,
  deleteAd,
  getAdById,
  getAllAds,
  getUserAds,
  updateAd
} from "../controller/ad.controller.js";

const adRouter = express.Router();

// ✅ Create ad (max 4 images)
adRouter.post("/", verifyToken, upload.array("images", 4), createAd);

// ✅ Get all ads (with optional query: category, location, search)
adRouter.get("/", getAllAds);

// ✅ Get logged-in user's ads
adRouter.get("/my", verifyToken, getUserAds);

// ✅ Get ad by ID
adRouter.get("/:id", getAdById);

// ✅ Update ad (only if user owns it)
adRouter.put("/:id", verifyToken, upload.array("images", 4), updateAd);

// ✅ Delete ad (only if user owns it)
adRouter.delete("/:id", verifyToken, deleteAd);


export default adRouter;
