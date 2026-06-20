const SpacePin = require('../models/SpacePin');
const User = require('../models/User');
const axios = require('axios');

exports.getPins = async (req, res) => {
  try {
    const activePins = await SpacePin.find({ expiresAt: { $gt: new Date() } })
      .populate('user', 'username profilePic bio isPremium sparkPoints');

    res.json({ success: true, pins: activePins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.dropPin = async (req, res) => {
  try {
    const { latitude, longitude, statusMessage, type } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let resolvedAddress = '';
    const token = process.env.LOCATIONIQ_ACCESS_TOKEN || 'pk.e31e6705bd87772aa6b6ab21a599c867';
    
    try {
      const response = await axios.get(`https://us1.locationiq.com/v1/reverse`, {
        params: {
          key: token,
          lat: latitude,
          lon: longitude,
          format: 'json'
        }
      });
      
      if (response.data && response.data.address) {
        const addr = response.data.address;
        resolvedAddress = addr.neighbourhood || addr.suburb || addr.city || addr.city_district || addr.town || addr.country || '';
      }
    } catch (apiError) {
      console.warn('LocationIQ Reverse Geocoding API call failed. Using coordinates representation.');
    }

    const finalStatus = resolvedAddress 
      ? `${statusMessage || 'I am here'} (${resolvedAddress})` 
      : statusMessage || 'I am here';

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    let pin = await SpacePin.findOne({ user: req.user.id });
    if (pin) {
      pin.latitude = latitude;
      pin.longitude = longitude;
      pin.statusMessage = finalStatus;
      pin.type = type || 'social';
      pin.expiresAt = expiresAt;
      await pin.save();
    } else {
      pin = new SpacePin({
        user: req.user.id,
        latitude,
        longitude,
        statusMessage: finalStatus,
        type: type || 'social',
        expiresAt
      });
      await pin.save();
    }

    const populatedPin = await SpacePin.findById(pin._id)
      .populate('user', 'username profilePic bio isPremium sparkPoints');

    if (req.io) {
      req.io.emit('pin_received', populatedPin);
    }

    res.json({ success: true, pin: populatedPin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePin = async (req, res) => {
  try {
    const pin = await SpacePin.findOneAndDelete({ user: req.user.id });
    if (!pin) {
      return res.status(404).json({ success: false, message: 'No active pin found' });
    }

    if (req.io) {
      req.io.emit('pin_deleted', { userId: req.user.id, pinId: pin._id });
    }

    res.json({ success: true, message: 'Location pin removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
