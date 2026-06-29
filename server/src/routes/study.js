const express = require("express");
const Note = require("../models/note");
const FlashcardSet = require("../models/flashcard");
const Quiz = require("../models/quiz");
const StudyPlan = require("../models/studyPlan");
const User = require("../models/user");
const { processAiRequest } = require("../services/aiGateway");
const { generateNoteSummaries } = require("../services/notesAi");
const { generateQuizQuestions } = require("../services/quizAi");
const { generateStudySchedule } = require("../services/studyPlannerAi");
const { analyzeLearningGaps } = require("../services/weaknessAnalyzerAi");
const { checkAndAwardAchievements } = require("../services/achievementService");

const router = express.Router();

// Helper to update study streak & time
async function recordStudyActivity(userId, minutes = 15) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.totalStudyTime = (user.totalStudyTime || 0) + minutes;

    const todayStr = new Date().toISOString().split("T")[0];
    if (user.lastStudyDate) {
      const lastStr = user.lastStudyDate.toISOString().split("T")[0];
      if (lastStr !== todayStr) {
        const diffTime = Math.abs(new Date(todayStr) - new Date(lastStr));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.studyStreak = (user.studyStreak || 0) + 1;
        } else if (diffDays > 1) {
          user.studyStreak = 1;
        }
      }
    } else {
      user.studyStreak = 1;
    }
    user.lastStudyDate = new Date();
    await user.save();
  } catch (error) {
    console.error("Failed to record study activity:", error);
  }
}

// 1. AI Study Coach (Tutor)
router.post("/coach", async (req, res) => {
  try {
    const { prompt, chatHistory } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt message is required." });
    }

    const aiResponse = await processAiRequest("tutor", { prompt, chatHistory }, req.user.id);
    await recordStudyActivity(req.user.id, 5); // 5 mins for interaction
    await checkAndAwardAchievements(req.user.id, "streak_updated");
    await checkAndAwardAchievements(req.user.id, "study_time_updated");
    res.json(aiResponse);
  } catch (error) {
    console.error("AI Study Coach error:", error);
    res.status(error.message.includes("Suspended") ? 403 : 500).json({ error: error.message });
  }
});

// 2. AI Notes
router.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    // Call Note AI Service to extract structured details
    const summaryData = await generateNoteSummaries(title, content);

    const newNote = new Note({
      userId: req.user.id,
      title,
      content,
      summary: summaryData.summary,
      keyPoints: summaryData.keyPoints,
      terms: summaryData.terms,
      formulas: summaryData.formulas,
      objectives: summaryData.objectives
    });

    await newNote.save();
    await recordStudyActivity(req.user.id, 15); // notes count as study
    await checkAndAwardAchievements(req.user.id, "note_created");
    await checkAndAwardAchievements(req.user.id, "streak_updated");
    await checkAndAwardAchievements(req.user.id, "study_time_updated");

    res.status(201).json({ note: newNote });
  } catch (error) {
    console.error("Notes creation error:", error);
    res.status(500).json({ error: "Failed to generate note summary." });
  }
});

router.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ error: "Failed to load notes." });
  }
});

router.get("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }
    res.json({ note });
  } catch (error) {
    console.error("Get note details error:", error);
    res.status(500).json({ error: "Failed to load note details." });
  }
});

// Update Note
router.put("/notes/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found." });

    if (title !== undefined) note.title = title;
    if (content !== undefined) {
      note.content = content;
      // Re-trigger summary extraction
      const summaryData = await generateNoteSummaries(note.title, content);
      note.summary = summaryData.summary;
      note.keyPoints = summaryData.keyPoints;
      note.terms = summaryData.terms;
      note.formulas = summaryData.formulas;
      note.objectives = summaryData.objectives;
    }

    await note.save();
    res.json({ note });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ error: "Failed to update note." });
  }
});

// Delete Note
router.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found." });
    res.json({ message: "Note deleted successfully." });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ error: "Failed to delete note." });
  }
});

// Share Note to feed
router.post("/notes/:id/share", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found." });

    const post = new Post({
      userId: req.user.id,
      content: `📝 Shared a digital lesson summary note: "${note.title}". You can study this note directly or save it to your notebook!`,
      type: "note_share",
      attachments: [{
        noteId: note._id,
        title: note.title
      }]
    });

    await post.save();
    res.status(201).json({ message: "Note shared to community feed!", post });
  } catch (error) {
    console.error("Share note error:", error);
    res.status(500).json({ error: "Failed to share note to feed." });
  }
});

// Import shared Note
router.post("/notes/import/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post || post.type !== "note_share" || !post.attachments?.[0]?.noteId) {
      return res.status(400).json({ error: "Invalid post or shared note attachment." });
    }

    const sourceNoteId = post.attachments[0].noteId;
    const sourceNote = await Note.findById(sourceNoteId);
    if (!sourceNote) {
      return res.status(404).json({ error: "Original study note was deleted or not found." });
    }

    // Create copy for current user
    const importedNote = new Note({
      userId: req.user.id,
      title: `${sourceNote.title} (Imported)`,
      content: sourceNote.content,
      summary: sourceNote.summary,
      keyPoints: sourceNote.keyPoints,
      terms: sourceNote.terms,
      formulas: sourceNote.formulas,
      objectives: sourceNote.objectives
    });

    await importedNote.save();
    res.status(201).json({ note: importedNote });
  } catch (error) {
    console.error("Import note error:", error);
    res.status(500).json({ error: "Failed to import note to notebook." });
  }
});

// 3. AI Quiz Generator
router.post("/quizzes", async (req, res) => {
  try {
    const { noteId, numQuestions = 5, questionType = "mixed" } = req.body;
    let title = "Quick Quiz";
    let content = "";

    if (noteId) {
      const note = await Note.findOne({ _id: noteId, userId: req.user.id });
      if (!note) {
        return res.status(404).json({ error: "Associated note not found." });
      }
      title = `${note.title} Quiz`;
      content = note.content;
    } else {
      return res.status(400).json({ error: "noteId is required to generate a quiz." });
    }

    const quizQuestions = await generateQuizQuestions(title, content, numQuestions, questionType);

    const newQuiz = new Quiz({
      userId: req.user.id,
      noteId,
      title,
      questions: quizQuestions,
      maxScore: quizQuestions.length
    });

    await newQuiz.save();
    res.status(201).json({ quiz: newQuiz });
  } catch (error) {
    console.error("Quiz creation error:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
});

router.get("/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({ error: "Failed to load quizzes." });
  }
});

router.post("/quizzes/:id/submit", async (req, res) => {
  try {
    const { answers } = req.body; // array of answers in order
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    let score = 0;
    quiz.questions.forEach((q, index) => {
      const studentAns = (answers[index] || "").trim().toLowerCase();
      const correctAns = q.answer.trim().toLowerCase();
      if (studentAns === correctAns) {
        score++;
      }
    });

    quiz.score = score;
    quiz.answers = answers;
    quiz.completed = true;
    quiz.completedAt = new Date();

    await quiz.save();
    await recordStudyActivity(req.user.id, 10); // 10 mins for taking quiz
    await checkAndAwardAchievements(req.user.id, "quiz_completed", { score, maxScore: quiz.maxScore });
    await checkAndAwardAchievements(req.user.id, "streak_updated");
    await checkAndAwardAchievements(req.user.id, "study_time_updated");

    res.json({ quiz });
  } catch (error) {
    console.error("Quiz submit error:", error);
    res.status(500).json({ error: "Failed to submit quiz." });
  }
});

// Delete Quiz
router.delete("/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!quiz) return res.status(404).json({ error: "Quiz not found." });
    res.json({ message: "Quiz deleted successfully." });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ error: "Failed to delete quiz." });
  }
});

// 4. AI Flashcards
router.post("/flashcards", async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ error: "noteId is required." });
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }

    // Flashcards are built from vocab terms generated in notes, fallback to custom generator if empty
    let cards = [];
    if (note.terms && note.terms.length > 0) {
      cards = note.terms.map(t => ({
        question: t.term,
        answer: t.definition,
        difficulty: "medium",
        isFavorite: false
      }));
    } else {
      // Prompt Gemini to generate cards
      const prompt = `
You are Flashcard AI. Generate 8 Q&A study cards for the topic: "${note.title}".
Content: "${note.content}"
Format as JSON array of cards:
[
  { "question": "Card question?", "answer": "Card answer text." }
]
`;
      const { queryGemini, cleanAndParseJSON } = require("../services/gemini");
      const rawRes = await queryGemini(prompt, true);
      const generated = cleanAndParseJSON(rawRes);
      cards = generated.map(c => ({
        question: c.question,
        answer: c.answer,
        difficulty: "medium",
        isFavorite: false
      }));
    }

    const newSet = new FlashcardSet({
      userId: req.user.id,
      noteId,
      title: `${note.title} Flashcards`,
      cards
    });

    await newSet.save();
    res.status(201).json({ flashcardSet: newSet });
  } catch (error) {
    console.error("Flashcard generation error:", error);
    res.status(500).json({ error: "Failed to generate flashcards." });
  }
});

router.get("/flashcards", async (req, res) => {
  try {
    const sets = await FlashcardSet.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ sets });
  } catch (error) {
    console.error("Get flashcards error:", error);
    res.status(500).json({ error: "Failed to load flashcard sets." });
  }
});

router.put("/flashcards/:setId", async (req, res) => {
  try {
    const { cardId, difficulty, isFavorite } = req.body;
    const set = await FlashcardSet.findOne({ _id: req.params.setId, userId: req.user.id });

    if (!set) {
      return res.status(404).json({ error: "Flashcard set not found." });
    }

    const card = set.cards.id(cardId);
    if (!card) {
      return res.status(404).json({ error: "Card not found." });
    }

    if (difficulty) card.difficulty = difficulty;
    if (isFavorite !== undefined) card.isFavorite = isFavorite;

    set.reviewedCount += 1;
    set.lastReviewedAt = new Date();

    await set.save();
    await recordStudyActivity(req.user.id, 2); // 2 mins for card review
    res.json({ flashcardSet: set });
  } catch (error) {
    console.error("Update card error:", error);
    res.status(500).json({ error: "Failed to update flashcard." });
  }
});

// Delete Flashcard Set
router.delete("/flashcards/:setId", async (req, res) => {
  try {
    const set = await FlashcardSet.findOneAndDelete({ _id: req.params.setId, userId: req.user.id });
    if (!set) return res.status(404).json({ error: "Flashcard set not found." });
    res.json({ message: "Flashcard set deleted successfully." });
  } catch (error) {
    console.error("Delete flashcard error:", error);
    res.status(500).json({ error: "Failed to delete flashcard set." });
  }
});

// 5. Study Planner
router.post("/planner", async (req, res) => {
  try {
    const { subjects, examDates, studyHours } = req.body;
    if (!subjects || !studyHours) {
      return res.status(400).json({ error: "Subjects list and daily study hours are required." });
    }

    const schedule = await generateStudySchedule(subjects, examDates, studyHours);

    // Save or update existing plan
    let plan = await StudyPlan.findOne({ userId: req.user.id });
    if (plan) {
      plan.schedules = schedule;
    } else {
      plan = new StudyPlan({
        userId: req.user.id,
        schedules: schedule
      });
    }

    await plan.save();
    res.json({ plan });
  } catch (error) {
    console.error("Planner generation error:", error);
    res.status(500).json({ error: "Failed to generate planner." });
  }
});

router.get("/planner", async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ userId: req.user.id });
    res.json({ plan: plan || { schedules: [] } });
  } catch (error) {
    console.error("Get planner error:", error);
    res.status(500).json({ error: "Failed to load planner." });
  }
});

router.post("/planner/toggle-task", async (req, res) => {
  try {
    const { date, taskId, completed } = req.body;
    const plan = await StudyPlan.findOne({ userId: req.user.id });
    if (!plan) {
      return res.status(404).json({ error: "Study plan not found." });
    }

    const dayObj = plan.schedules.find(d => d.date === date);
    if (!dayObj) return res.status(442).json({ error: "Invalid date block." });

    const task = dayObj.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: "Task not found." });

    task.completed = completed;
    await plan.save();

    if (completed) {
      await recordStudyActivity(req.user.id, task.duration || 30);
    }

    res.json({ plan });
  } catch (error) {
    console.error("Toggle planner task error:", error);
    res.status(500).json({ error: "Failed to update task status." });
  }
});

// 6. Smart Learning & Weakness Analyzer
router.get("/progress", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    // Gather completed quizzes with errors to detect learning weaknesses
    const completedQuizzes = await Quiz.find({ userId: req.user.id, completed: true });
    const quizMistakes = [];
    completedQuizzes.forEach(qz => {
      qz.questions.forEach((q, idx) => {
        const studentAns = (qz.answers[idx] || "").trim().toLowerCase();
        const correctAns = q.answer.trim().toLowerCase();
        if (studentAns !== correctAns) {
          quizMistakes.push({
            quizTitle: qz.title,
            question: q.question,
            questionType: q.questionType,
            explanation: q.explanation
          });
        }
      });
    });

    // Gather cards rated hard
    const flashcardSets = await FlashcardSet.find({ userId: req.user.id });
    const hardCards = [];
    flashcardSets.forEach(set => {
      set.cards.forEach(c => {
        if (c.difficulty === "hard") {
          hardCards.push({ set: set.title, question: c.question });
        }
      });
    });

    // Run AI gap analysis
    let gaps = { weakTopics: [], strongTopics: [], nextActionSteps: [] };
    if (quizMistakes.length > 0 || hardCards.length > 0) {
      gaps = await analyzeLearningGaps(quizMistakes.slice(0, 10), hardCards.slice(0, 10));
    }

    res.json({
      user,
      totalQuizzes: completedQuizzes.length,
      avgQuizScore: completedQuizzes.length > 0
        ? Math.round((completedQuizzes.reduce((acc, q) => acc + (q.score / q.maxScore), 0) / completedQuizzes.length) * 100)
        : 0,
      totalFlashcardsReviewed: flashcardSets.reduce((acc, s) => acc + (s.reviewedCount || 0), 0),
      gaps
    });
  } catch (error) {
    console.error("Get progress stats error:", error);
    res.status(500).json({ error: "Failed to load progress stats." });
  }
});

// 7. Homework Helper Router
router.post("/homework-helper", async (req, res) => {
  try {
    const { problem, studentSolution } = req.body;
    if (!problem) {
      return res.status(400).json({ error: "Problem description is required." });
    }

    const details = await processAiRequest("homeworkHelper", { problem, studentSolution }, req.user.id);
    await recordStudyActivity(req.user.id, 8); // 8 mins
    res.json(details);
  } catch (error) {
    console.error("Homework Helper error:", error);
    res.status(error.message.includes("Suspended") ? 403 : 500).json({ error: error.message });
  }
});

// 8. Concept Map Router
router.post("/concept-map", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const map = await processAiRequest("conceptMap", { topic }, req.user.id);
    res.json(map);
  } catch (error) {
    console.error("Concept map error:", error);
    res.status(500).json({ error: "Failed to build concept map." });
  }
});

// 9. Profile Settings
router.post("/profile", async (req, res) => {
  try {
    const { school, grade, subjects, studyGoals, preferredStudyTime, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (school !== undefined) user.school = school;
    if (grade !== undefined) user.grade = grade;
    if (subjects !== undefined) user.subjects = subjects;
    if (studyGoals !== undefined) user.studyGoals = studyGoals;
    if (preferredStudyTime !== undefined) user.preferredStudyTime = preferredStudyTime;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// 10. Study Pledge Unlock Route (Resets Suspended Tokens)
router.post("/profile/reset-ai", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.aiTokenSuspended = false;
    user.aiSuspensionReason = "";
    await user.save();

    res.json({ message: "Connectify AI study token restored successfully. Happy studying!", user });
  } catch (error) {
    console.error("Study pledge reset error:", error);
    res.status(500).json({ error: "Failed to unlock AI tutor." });
  }
});

// 11. User Management - Get all registered students
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("username email avatar school grade studyStreak totalStudyTime bio achievements")
      .sort({ studyStreak: -1, totalStudyTime: -1 });
    res.json({ users });
  } catch (error) {
    console.error("Fetch users directory error:", error);
    res.status(500).json({ error: "Failed to load users directory." });
  }
});

// 12. User Management - Get individual student academic stats
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("username avatar school grade studyStreak totalStudyTime bio achievements subjects studyGoals preferredStudyTime");
    if (!user) return res.status(404).json({ error: "Student profile not found." });

    // Gather count of notes and completed quizzes for stats overview
    const notesCount = await Note.countDocuments({ userId: req.params.id });
    const quizzesCount = await Quiz.countDocuments({ userId: req.params.id, completed: true });

    res.json({
      user,
      stats: {
        notesCount,
        quizzesCount,
      }
    });
  } catch (error) {
    console.error("Fetch individual user error:", error);
    res.status(500).json({ error: "Failed to load user profile." });
  }
});

module.exports = router;
