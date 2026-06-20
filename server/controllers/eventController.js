const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'username profilePic isPremium')
      .populate('going', 'username profilePic')
      .populate('interested', 'username profilePic')
      .sort({ date: 1 });

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and Date are required' });
    }

    const newEvent = new Event({
      title,
      description: description || '',
      date: new Date(date),
      location: location || '',
      organizer: req.user.id,
      going: [req.user.id],
      interested: []
    });

    await newEvent.save();
    const populated = await Event.findById(newEvent._id)
      .populate('organizer', 'username profilePic isPremium');

    res.status(201).json({ success: true, event: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.going = event.going.filter(id => id.toString() !== req.user.id);
    event.interested = event.interested.filter(id => id.toString() !== req.user.id);

    if (status === 'going') {
      event.going.push(req.user.id);
    } else if (status === 'interested') {
      event.interested.push(req.user.id);
    }

    await event.save();
    const populated = await Event.findById(event._id)
      .populate('organizer', 'username profilePic isPremium')
      .populate('going', 'username profilePic')
      .populate('interested', 'username profilePic');

    res.json({ success: true, event: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
