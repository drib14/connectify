const express = require('express');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createEvent, getEvents, getEvent, attendEvent, addToAlbum } = require('../controllers/eventController');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);

router.post('/', auth, upload.fields([{ name: 'eventMedia', maxCount: 5 }]), createEvent);
router.post('/:id/attend', auth, attendEvent);
router.post('/:id/album', auth, upload.fields([{ name: 'eventMedia', maxCount: 10 }]), addToAlbum);

module.exports = router;
