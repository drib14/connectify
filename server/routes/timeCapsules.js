const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const timeCapsuleController = require('../controllers/timeCapsuleController');
const { upload } = require('../utils/upload');

// Create new capsule check-in
router.post('/', auth, upload.single('media'), timeCapsuleController.createTimeCapsule);

// Retrieve all capsules visible to user
router.get('/', auth, timeCapsuleController.getTimeCapsules);

// Delete a capsule
router.delete('/:id', auth, timeCapsuleController.deleteTimeCapsule);

module.exports = router;
