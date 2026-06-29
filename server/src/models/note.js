const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  summary: { type: String, default: "" },
  keyPoints: { type: [String], default: [] },
  terms: [{
    term: { type: String, required: true },
    definition: { type: String, required: true }
  }],
  formulas: { type: [String], default: [] },
  objectives: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Note || mongoose.model("Note", NoteSchema);
