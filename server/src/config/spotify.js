import axios from 'axios';

let cachedToken = null;
let tokenExpiry = null;

export const getSpotifyAccessToken = async () => {
  const now = new Date();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Spotify client credentials are not configured in environment variables.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cachedToken = response.data.access_token;
    // Expire token slightly early to avoid race conditions (expires_in is usually 3600 seconds)
    tokenExpiry = new Date(now.getTime() + (response.data.expires_in - 60) * 1000);
    return cachedToken;
  } catch (error) {
    console.error('Failed to get Spotify Access Token:', error.response?.data || error.message);
    throw error;
  }
};
