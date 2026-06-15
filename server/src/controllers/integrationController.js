import axios from 'axios';
import { getSpotifyAccessToken } from '../config/spotify.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

// SPOTIFY VIBES
export const searchSpotifyTracks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const token = await getSpotifyAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const tracks = response.data.tracks?.items.map((item) => ({
      id: item.id,
      title: item.name,
      artist: item.artists.map((a) => a.name).join(', '),
      coverUrl: item.album.images[0]?.url || '',
      previewUrl: item.preview_url || '',
    })) || [];

    res.json(tracks);
  } catch (error) {
    console.error('Spotify Search Error:', error.message);
    res.status(500).json({ message: 'Failed to search Spotify tracks' });
  }
};

// PAYMONGO SUPPORT & PREMIUM
const getPayMongoSecretKey = () => {
  if (process.env.PAYMONGO_PUBLIC_KEY?.startsWith('sk_')) return process.env.PAYMONGO_PUBLIC_KEY;
  if (process.env.PAYMONGO_SECRET_KEY?.startsWith('sk_')) return process.env.PAYMONGO_SECRET_KEY;
  return process.env.PAYMONGO_SECRET_KEY;
};

export const createPayMongoCheckout = async (req, res) => {
  try {
    const secretKey = getPayMongoSecretKey();
    if (!secretKey) {
      return res.status(500).json({ message: 'PayMongo secret key is not configured' });
    }

    const token = Buffer.from(secretKey).toString('base64');
    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            billing: {
              email: req.user.email,
              name: req.user.username,
            },
            line_items: [
              {
                amount: 15000, // 150 PHP in centavos
                currency: 'PHP',
                name: 'Connectify Premium Badge',
                quantity: 1,
              },
            ],
            payment_method_types: ['card', 'gcash', 'paymaya', 'grab_pay'],
            success_url: 'http://localhost:5173/premium?status=success&session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/premium?status=cancelled',
            description: 'Unlock Connectify Premium Canvas Badge, Aura AI features, and custom vibes.',
          },
        },
      },
      {
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const checkoutUrl = response.data.data.attributes.checkout_url;
    const sessionId = response.data.data.id;

    // Create a pending payment log in the database
    await Payment.create({
      user: req.user._id,
      amount: 150,
      referenceId: sessionId,
      status: 'pending',
    });

    res.json({ checkoutUrl, sessionId });
  } catch (error) {
    console.error('PayMongo Checkout Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initiate checkout session' });
  }
};

export const verifyPayMongoStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const secretKey = getPayMongoSecretKey();
    if (!secretKey) {
      return res.status(500).json({ message: 'PayMongo secret key is not configured' });
    }

    const payment = await Payment.findOne({ referenceId: sessionId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment reference not found' });
    }

    const token = Buffer.from(secretKey).toString('base64');
    const response = await axios.get(
      `https://api.paymongo.com/v1/checkout_sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Basic ${token}`,
        },
      }
    );

    const sessionData = response.data.data;
    const paymentStatus = sessionData.attributes.payment_intent?.attributes?.status;

    if (paymentStatus === 'succeeded') {
      payment.status = 'paid';
      await payment.save();

      // Upgrade user to Premium
      await User.findByIdAndUpdate(payment.user, { isPremium: true });
      return res.json({ status: 'paid', message: 'Successfully upgraded to Premium!' });
    } else if (paymentStatus === 'failed') {
      payment.status = 'failed';
      await payment.save();
      return res.json({ status: 'failed', message: 'Payment transaction failed' });
    }

    res.json({ status: 'pending', message: 'Payment still processing' });
  } catch (error) {
    console.error('PayMongo Verification Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to verify transaction' });
  }
};

// LOCATIONIQ GEOLOCATION SEARCH
export const searchLocations = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const token = process.env.LOCATIONIQ_ACCESS_TOKEN;
    const response = await axios.get(
      `https://us1.locationiq.com/v1/search?key=${token}&q=${encodeURIComponent(query)}&format=json&limit=5`
    );

    const locations = response.data.map((item) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));

    res.json(locations);
  } catch (error) {
    console.error('LocationIQ Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve location check-ins' });
  }
};

// GEMINI AI (AURA ASSISTANT)
export const askAura = async (req, res) => {
  try {
    const { prompt, action } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt parameter is required' });
    }

    let finalPrompt = prompt;
    if (action === 'caption') {
      finalPrompt = `You are Aura, the social assistant for Connectify (a premium platform like Facebook). Write a creative, cool, and highly engaging social media caption for this post content, using emojis and matching hashtags:\n"${prompt}"`;
    } else if (action === 'translate') {
      finalPrompt = `You are Aura, the translator for Connectify. Translate the following text into clear, modern English. If it is already in English, translate it to conversational Tagalog:\n"${prompt}"`;
    } else if (action === 'chat') {
      finalPrompt = `You are Aura, the resident AI Companion of Connectify. Answer the user request briefly, in a friendly and casual social media tone:\n"${prompt}"`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key is not configured' });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: finalPrompt }] }],
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Aura.';
    res.json({ text: reply.trim() });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to get assistance from Aura' });
  }
};

export const getSpotifyLyrics = async (req, res) => {
  try {
    const { title, artist } = req.query;
    if (!title || !artist) {
      return res.status(400).json({ message: 'Title and artist parameters are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key is not configured' });
    }

    const prompt = `You are Aura, the Connectify music assistant. Provide the lyrics for the song "${title}" by "${artist}". If the exact lyrics are unavailable or copyrighted, write a beautiful, accurate, and poetic representation of the song lyrics inspired by its theme. Return ONLY the lyrics formatted with line breaks, with no comments, introductory notes, outro, artist labels, or formatting tags.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const lyrics = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Lyrics not available.';
    res.json({ lyrics: lyrics.trim() });
  } catch (error) {
    console.error('Gemini Lyrics Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to retrieve lyrics' });
  }
};

