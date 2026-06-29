const mongoose = require("mongoose");

const StudyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  schedules: [{
    date: { type: String, required: true }, // e.g. "YYYY-MM-DD"
    tasks: [{
      subject: { type: String, required: true },
      taskName: { type: String, required: true },
      duration: { type: Number, default: 30 }, // in minutes
      completed: { type: Boolean, default: false }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.StudyPlan || mongoose.model("StudyPlan", StudyPlanSchema);
