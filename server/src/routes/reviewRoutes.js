const express = require('express');
const { auth } = require('../middleware/auth');
const { createReview, getReviews, markHelpful } = require('../controllers/reviewController');

const router = express.Router();

router.get('/', getReviews);
router.post('/', auth, createReview);
router.post('/:id/helpful', auth, markHelpful);

module.exports = router;
