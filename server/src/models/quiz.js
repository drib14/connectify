const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
  title: { type: String, required: true, trim: true },
  questions: [{
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    answer: { type: String, required: true },
    questionType: { type: String, enum: ["mcq", "tf", "fill", "short"], default: "mcq" },
    explanation: { type: String, default: "" }
  }],
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  answers: { type: [String], default: [] },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
