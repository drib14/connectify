const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createQuestion = async (req, res) => {
  try {
    const { title, content, tags, category, rewardPoints, isBounty, bountyAmount } = req.body;
    const question = new Question({
      author: req.user._id,
      title, content,
      tags: tags ? JSON.parse(tags) : [],
      category: category || 'other',
      rewardPoints: rewardPoints || 10,
      isBounty: isBounty === 'true',
      bountyAmount: bountyAmount || 0,
    });

    await question.save();
    const populated = await Question.findById(question._id).populate('author', 'firstName lastName username avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, tag, status, sort = 'newest' } = req.query;
    const query = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (status) query.status = status;

    const sortOption = sort === 'popular' ? { 'upvotes.length': -1 } : sort === 'unanswered' ? { answers: { $size: 0 } } : { createdAt: -1 };

    const questions = await Question.find(query)
      .populate('author', 'firstName lastName username avatar contributionScore')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);
    res.json({ questions, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'firstName lastName username avatar contributionScore')
      .populate('answers.author', 'firstName lastName username avatar contributionScore');
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const addAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    question.answers.push({ author: req.user._id, content: req.body.content });
    if (question.status === 'open') question.status = 'answered';
    await question.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 5 } });

    if (question.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: question.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.firstName} answered your question: "${question.title}"`,
        link: `/questions/${question._id}`,
      });
    }

    const updated = await Question.findById(question._id)
      .populate('answers.author', 'firstName lastName username avatar contributionScore');
    res.json(updated.answers);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const acceptAnswer = async (req, res) => {
  try {
    const question = await Question.findOne({ _id: req.params.id, author: req.user._id });
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    question.bestAnswer = req.params.answerId;
    question.status = 'closed';
    await question.save();

    const answer = question.answers.id(req.params.answerId);
    if (answer) {
      await User.findByIdAndUpdate(answer.author, { $inc: { contributionScore: question.rewardPoints } });
    }

    res.json({ message: 'Answer accepted!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const upvoteAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found.' });

    const hasUpvoted = answer.upvotes.includes(req.user._id);
    if (hasUpvoted) {
      answer.upvotes.pull(req.user._id);
    } else {
      answer.upvotes.push(req.user._id);
      answer.downvotes.pull(req.user._id);
    }
    await question.save();

    res.json({ upvotes: answer.upvotes.length, downvotes: answer.downvotes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createQuestion, getQuestions, getQuestion, addAnswer, acceptAnswer, upvoteAnswer };
