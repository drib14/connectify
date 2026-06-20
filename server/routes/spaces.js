const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const spaceController = require('../controllers/spaceController');

// Get all active pins on map (where expiresAt is in the future)
router.get('/pins', auth, spaceController.getPins);

// Drop/Update location pin
router.post('/pin', auth, spaceController.dropPin);

// Remove location pin
router.delete('/pin', auth, spaceController.deletePin);

module.exports = router;
