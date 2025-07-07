// controllers/ad.controller.js
import Ad from "../models/ad.model.js";
import cloudinary from "../config/cloudinary.js"; 

export const createAd = async (req, res) => {
  try {
    const imageUrls = req.files.map(file => file.path);
    const ad = new Ad({
      ...req.body,
      images: imageUrls,
      user: req.user.id, // added by auth middleware
    });
    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    res.status(500).json({ error: "Failed to create ad" });
  }
};

export const getAllAds = async (req, res) => {
  try {
    const { category, location, search, approved } = req.query;

    const query = {};

    // approved filter එකට handle කරන්න - "true" හෝ "false" string එක boolean එකට convert කරන්න
    if (approved !== undefined) {
      query.approved = approved === "true"; // "true" කියන string එක boolean true වෙයි, නැත්තම් false
    }

    if (category) query.category = category;
    if (location) query.location = location;
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const ads = await Ad.find(query).populate("user", "name");
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ads" });
  }
};



export const getUserAds = async (req, res) => {
  try {
    const ads = await Ad.find({ user: req.user.id });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your ads" });
  }
};

export const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate("user", "name phone");
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};


export const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    if (ad.user.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    // 1. Delete old images from Cloudinary if new files uploaded
    if (req.files && req.files.length > 0) {
      // Extract public IDs from old image URLs
      const extractPublicId = (url) => {
        // Cloudinary URLs usually contain 'upload/...' before public id
        const regex = /upload\/(?:v\d+\/)?(.+)\.\w+$/;
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      await Promise.all(
        ad.images.map(async (url) => {
          const publicId = extractPublicId(url);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.warn(`Failed to delete Cloudinary image: ${publicId}`);
            }
          }
        })
      );
    }

    // 2. Set new images URLs or keep old if no new files
    const imageUrls = req.files && req.files.length > 0
      ? req.files.map(file => file.path)
      : ad.images;

    // 3. Update ad with new data & images
    Object.assign(ad, { ...req.body, images: imageUrls });
    await ad.save();

    res.json(ad);
  } catch (err) {
    console.error("Update ad error:", err);
    res.status(500).json({ error: "Failed to update ad" });
  }
};

// make sure this is the configured instance

export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    if (ad.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const extractPublicId = (url) => {
      const regex = /upload\/(?:v\d+\/)?(.+)\.\w+$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    await Promise.all(
      ad.images.map(async (url) => {
        const publicId = extractPublicId(url);
        if (!publicId) return;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("❌ Failed to delete Cloudinary image:", publicId);
        }
      })
    );

    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: "Ad and associated images deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete ad" });
  }
};