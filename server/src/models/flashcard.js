const mongoose = require("mongoose");

const FlashcardSetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
  title: { type: String, required: true, trim: true },
  cards: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    isFavorite: { type: Boolean, default: false }
  }],
  reviewedCount: { type: Number, default: 0 },
  lastReviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.FlashcardSet || mongoose.model("FlashcardSet", FlashcardSetSchema);
