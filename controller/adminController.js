import User from "../models/user.model.js";
import Ad from "../models/ad.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeAds = await Ad.countDocuments({ approved: true });
    const pendingAds = await Ad.countDocuments({ approved: false });

    res.json({
      totalUsers,
      activeAds,
      pendingAds,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getUnapprovedAds = async (req, res) => {
  try {
    const ads = await Ad.find({ approved: false }).populate("user", "name email");
    res.status(200).json(ads);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unapproved ads", error: err });
  }
};

export const approveAd = async (req, res) => {
  const adId = req.params.id;
  try {
    const ad = await Ad.findById(adId);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    ad.approved = true;
    await ad.save();

    res.status(200).json({ message: "Ad approved successfully", ad });
  } catch (err) {
    res.status(500).json({ message: "Error approving ad", error: err });
  }
};
