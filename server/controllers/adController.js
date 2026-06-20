const AdCampaign = require('../models/AdCampaign');
const { uploadToCloudinary } = require('../utils/upload');

exports.getActiveAds = async (req, res) => {
  try {
    const ads = await AdCampaign.find({ status: 'active' })
      .populate('advertiser', 'username profilePic');
    res.json({ success: true, ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyAds = async (req, res) => {
  try {
    const ads = await AdCampaign.find({ advertiser: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const { title, budget, redirectUrl } = req.body;
    if (!title || !budget) {
      return res.status(400).json({ success: false, message: 'Title and Budget are required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Ad Banner Image is required' });
    }

    const bannerUrl = await uploadToCloudinary(req.file.buffer, 'image');

    const newAd = new AdCampaign({
      advertiser: req.user.id,
      title,
      budget: parseFloat(budget),
      redirectUrl: redirectUrl || '',
      bannerUrl,
      status: 'active'
    });

    await newAd.save();
    res.status(201).json({ success: true, ad: newAd });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.registerClick = async (req, res) => {
  try {
    const ad = await AdCampaign.findById(req.params.adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad campaign not found' });
    }

    ad.clicksCount += 1;
    
    const clickCost = 0.10;
    ad.budget = Math.max(ad.budget - clickCost, 0);
    
    if (ad.budget <= 0) {
      ad.status = 'completed';
    }

    await ad.save();
    res.json({ success: true, budgetLeft: ad.budget, clicksCount: ad.clicksCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
