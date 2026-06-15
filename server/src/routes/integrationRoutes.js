import express from 'express';
import {
  searchSpotifyTracks,
  createPayMongoCheckout,
  verifyPayMongoStatus,
  searchLocations,
  askAura,
  getSpotifyLyrics,
} from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/spotify/search', protect, searchSpotifyTracks);
router.get('/spotify/lyrics', protect, getSpotifyLyrics);
router.post('/paymongo/checkout', protect, createPayMongoCheckout);
router.get('/paymongo/status/:sessionId', protect, verifyPayMongoStatus);
router.get('/locationiq/search', protect, searchLocations);
router.post('/gemini/aura', protect, askAura);

export default router;
