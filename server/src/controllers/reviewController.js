const Review = require('../models/Review');
const User = require('../models/User');

const createReview = async (req, res) => {
  try {
    const { targetType, targetId, targetName, content, rating, tags, verificationProof } = req.body;
    const review = new Review({
      author: req.user._id,
      targetType, targetId, targetName, content,
      rating: parseInt(rating),
      tags: tags ? JSON.parse(tags) : [],
      isVerified: !!verificationProof,
      verificationProof: verificationProof ? JSON.parse(verificationProof) : undefined,
    });

    await review.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 5 } });

    const populated = await Review.findById(review._id).populate('author', 'firstName lastName username avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { targetType, targetId, verifiedOnly, page = 1, limit = 20 } = req.query;
    const query = {};
    if (targetType) query.targetType = targetType;
    if (targetId) query.targetId = targetId;
    if (verifiedOnly === 'true') query.isVerified = true;

    const reviews = await Review.find(query)
      .populate('author', 'firstName lastName username avatar contributionScore')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);
    const avgRating = await Review.aggregate([
      { $match: query },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    res.json({ reviews, total, averageRating: avgRating[0]?.avg || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    const isHelpful = review.helpful.includes(req.user._id);
    if (isHelpful) {
      review.helpful.pull(req.user._id);
    } else {
      review.helpful.push(req.user._id);
      review.notHelpful.pull(req.user._id);
    }
    await review.save();

    res.json({ helpful: review.helpful.length, notHelpful: review.notHelpful.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createReview, getReviews, markHelpful };
