const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', auth, eventController.getEvents);

// Create event
router.post('/', auth, eventController.createEvent);

// RSVP to event
router.post('/rsvp/:eventId', auth, eventController.rsvpEvent);

module.exports = router;
