const express = require('express');
const { auth } = require('../middleware/auth');
const { getJournal, addEntry, updateEntry, deleteEntry } = require('../controllers/journalController');

const router = express.Router();

router.get('/', auth, getJournal);
router.post('/entry', auth, addEntry);
router.put('/entry/:entryId', auth, updateEntry);
router.delete('/entry/:entryId', auth, deleteEntry);

module.exports = router;
