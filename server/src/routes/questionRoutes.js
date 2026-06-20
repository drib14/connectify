const express = require('express');
const { auth } = require('../middleware/auth');
const { createQuestion, getQuestions, getQuestion, addAnswer, acceptAnswer, upvoteAnswer } = require('../controllers/questionController');

const router = express.Router();

router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', auth, createQuestion);
router.post('/:id/answer', auth, addAnswer);
router.put('/:id/accept/:answerId', auth, acceptAnswer);
router.post('/:id/upvote/:answerId', auth, upvoteAnswer);

module.exports = router;
