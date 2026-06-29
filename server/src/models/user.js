const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, trim: true },
  password: { type: String },
  googleId: { type: String },
  avatar: { type: String },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
  school: { type: String, default: "" },
  grade: { type: String, default: "" },
  subjects: { type: [String], default: [] },
  studyGoals: { type: String, default: "" },
  preferredStudyTime: { type: String, default: "" },
  aiTokenSuspended: { type: Boolean, default: false },
  aiSuspensionReason: { type: String, default: "" },
  studyStreak: { type: Number, default: 0 },
  lastStudyDate: { type: Date },
  totalStudyTime: { type: Number, default: 0 }, // in minutes
  bio: { type: String, default: "" },
  achievements: { type: [{ name: String, earnedAt: { type: Date, default: Date.now } }], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
