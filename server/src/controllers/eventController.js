const Event = require('../models/Event');
const User = require('../models/User');

const createEvent = async (req, res) => {
  try {
    const { title, description, type, date, endDate, location, maxAttendees, tags, isPrivate, skillExchangeData, studySessionData, matchCriteria, communityId } = req.body;

    const event = new Event({
      title, description,
      type: type || 'general',
      organizer: req.user._id,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      maxAttendees: maxAttendees || undefined,
      tags: tags ? JSON.parse(tags) : [],
      isPrivate: isPrivate === 'true',
      community: communityId || undefined,
      attendees: [{ user: req.user._id, status: 'going' }],
    });

    if (location) {
      const loc = JSON.parse(location);
      event.location = { type: 'Point', coordinates: [loc.lng || 0, loc.lat || 0], address: loc.address, isOnline: loc.isOnline || false, onlineLink: loc.onlineLink || '' };
    }

    if (skillExchangeData) event.skillExchangeData = JSON.parse(skillExchangeData);
    if (studySessionData) event.studySessionData = JSON.parse(studySessionData);
    if (matchCriteria) event.matchCriteria = JSON.parse(matchCriteria);

    if (req.files?.eventMedia) event.coverImage = req.files.eventMedia[0]?.path;

    await event.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 10 } });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getEvents = async (req, res) => {
  try {
    const { type, page = 1, limit = 20, upcoming, lat, lng } = req.query;
    const query = {};

    if (type && type !== 'all') query.type = type;
    
    const now = new Date();
    if (upcoming === 'true') {
      query.$or = [
        { date: { $gte: now } },
        { endDate: { $gte: now }, date: { $lte: now } }
      ];
    } else if (upcoming === 'false') {
      query.$and = [
        { date: { $lt: now } },
        { $or: [{ endDate: { $exists: false } }, { endDate: { $lt: now } }] }
      ];
    }

    if (lat && lng) {
      query['location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 50000,
        },
      };
    }

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName username avatar')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName username avatar')
      .populate('attendees.user', 'firstName lastName username avatar');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const attendEvent = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const existingIdx = event.attendees.findIndex(a => a.user.toString() === req.user._id.toString());
    const isNewRSVP = existingIdx === -1;
    if (existingIdx >= 0) {
      event.attendees[existingIdx].status = status || 'going';
    } else {
      if (event.maxAttendees && event.attendees.filter(a => a.status === 'going').length >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is full.' });
      }
      event.attendees.push({ user: req.user._id, status: status || 'going' });
    }

    await event.save();
    if (isNewRSVP) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 5 } });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const addToAlbum = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (req.files?.eventMedia) {
      const photos = req.files.eventMedia.map(f => ({
        contributor: req.user._id,
        media: { url: f.path, type: f.mimetype.startsWith('image/') ? 'image' : 'video', publicId: f.filename },
        caption: req.body.caption || '',
      }));
      event.collaborationAlbum.push(...photos);
      await event.save();
    }

    res.json(event.collaborationAlbum);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createEvent, getEvents, getEvent, attendEvent, addToAlbum };
