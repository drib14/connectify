const express = require('express');
const { auth } = require('../middleware/auth');
const { createGoal, getMyGoals, getPublicGoals, updateGoalProgress, checkIn, setAccountabilityPartner, deleteGoal } = require('../controllers/goalController');

const router = express.Router();

router.get('/mine', auth, getMyGoals);
router.get('/public', getPublicGoals);

router.post('/', auth, createGoal);
router.put('/:id/progress', auth, updateGoalProgress);
router.post('/:id/check-in', auth, checkIn);
router.put('/:id/partner', auth, setAccountabilityPartner);
router.delete('/:id', auth, deleteGoal);

module.exports = router;
