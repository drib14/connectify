const express = require('express');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProfile, updateProfile, updateTrustCircles, toggleFollow,
  updateSkillShowcase, deleteSkillShowcase,
  requestAccountabilityPartner, respondAccountabilityRequest,
  updateDigitalLegacy, getPrivacyDashboard,
  searchUsers, getSuggestedUsers, createDisposableProfile,
  updateUsageTime, createPaymentCheckout, verifyPayment,
} = require('../controllers/userController');

const router = express.Router();

router.get('/search', auth, searchUsers);
router.get('/suggested', auth, getSuggestedUsers);
router.get('/privacy-dashboard', auth, getPrivacyDashboard);
router.get('/profile/:username', getProfile);

router.put('/profile', auth, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), updateProfile);
router.put('/trust-circles', auth, updateTrustCircles);
router.post('/follow/:userId', auth, toggleFollow);

router.post('/skill-showcase', auth, upload.fields([{ name: 'showcaseMedia', maxCount: 5 }]), updateSkillShowcase);
router.delete('/skill-showcase/:itemId', auth, deleteSkillShowcase);

router.post('/accountability/request', auth, requestAccountabilityPartner);
router.post('/accountability/respond', auth, respondAccountabilityRequest);

router.put('/digital-legacy', auth, updateDigitalLegacy);
router.post('/disposable-profile', auth, createDisposableProfile);
router.post('/usage-time', auth, updateUsageTime);
router.post('/checkout', auth, createPaymentCheckout);
router.post('/verify-payment', auth, verifyPayment);

module.exports = router;
