const MarketplaceItem = require('../models/MarketplaceItem');
const { uploadToCloudinary } = require('../utils/upload');

exports.getItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const items = await MarketplaceItem.find(filter)
      .populate('seller', 'username profilePic isPremium')
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { title, price, description, category, location } = req.body;
    if (!title || !price) {
      return res.status(400).json({ success: false, message: 'Title and Price are required' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'image');
    }

    const newItem = new MarketplaceItem({
      title,
      price: parseFloat(price),
      description: description || '',
      category: category || 'Electronics',
      location: location || '',
      image: imageUrl,
      seller: req.user.id
    });

    await newItem.save();
    const populated = await MarketplaceItem.findById(newItem._id).populate('seller', 'username profilePic isPremium');

    res.status(201).json({ success: true, item: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item listing not found' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await MarketplaceItem.findByIdAndDelete(req.params.itemId);
    res.json({ success: true, message: 'Listing removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
