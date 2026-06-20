const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const marketplaceController = require('../controllers/marketplaceController');
const { upload } = require('../utils/upload');

// Get all marketplace items
router.get('/', auth, marketplaceController.getItems);

// Create a listing (supports single image upload to Cloudinary)
router.post('/', auth, upload.single('image'), marketplaceController.createItem);

// Delete a listing
router.delete('/:itemId', auth, marketplaceController.deleteItem);

module.exports = router;
