const express = require('express');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createCommunity, getCommunities, getCommunity,
  joinCommunity, leaveCommunity,
  createVote, castVote,
  addSolution, addWikiPage, updateWikiPage,
  addVolunteerOpportunity, signUpVolunteer,
} = require('../controllers/communityController');

const router = express.Router();

router.get('/', getCommunities);
router.get('/:id', getCommunity);

router.post('/', auth, upload.fields([{ name: 'communityMedia', maxCount: 1 }]), createCommunity);
router.post('/:id/join', auth, joinCommunity);
router.post('/:id/leave', auth, leaveCommunity);

router.post('/:id/vote', auth, createVote);
router.post('/:id/cast-vote', auth, castVote);

router.post('/:id/solution', auth, addSolution);
router.post('/:id/wiki', auth, addWikiPage);
router.put('/:id/wiki/:pageId', auth, updateWikiPage);

router.post('/:id/volunteer', auth, addVolunteerOpportunity);
router.post('/:id/volunteer/:oppId/signup', auth, signUpVolunteer);

module.exports = router;
