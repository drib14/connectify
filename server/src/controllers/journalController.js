const Journal = require('../models/Journal');

const getJournal = async (req, res) => {
  try {
    let journal = await Journal.findOne({ user: req.user._id });
    if (!journal) {
      journal = await Journal.create({ user: req.user._id, entries: [] });
    }
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const addEntry = async (req, res) => {
  try {
    const { mood, reflection, gratitude, goals } = req.body;
    let journal = await Journal.findOne({ user: req.user._id });
    if (!journal) {
      journal = await Journal.create({ user: req.user._id, entries: [] });
    }

    journal.entries.push({
      mood, reflection,
      gratitude: gratitude || [],
      goals: goals || [],
    });

    await journal.save();
    res.json(journal.entries[journal.entries.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateEntry = async (req, res) => {
  try {
    const journal = await Journal.findOne({ user: req.user._id });
    const entry = journal.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: 'Entry not found.' });

    Object.assign(entry, req.body);
    await journal.save();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const journal = await Journal.findOne({ user: req.user._id });
    journal.entries.pull({ _id: req.params.entryId });
    await journal.save();
    res.json({ message: 'Entry deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getJournal, addEntry, updateEntry, deleteEntry };
