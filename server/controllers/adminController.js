const User = require('../models/User');
const Report = require('../models/Report');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Restrict a user's actions
// @route   PUT /api/admin/users/:id/restrict
// @access  Admin
exports.restrictUser = async (req, res) => {
  const { canLogin, canPost, canComment, canShare, reason, durationInHours } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.restrictions = {
        canLogin, canPost, canComment, canShare, reason,
        expires: Date.now() + durationInHours * 60 * 60 * 1000,
      };
      user.violations.push({ reason, admin: req.user._id });
      if (user.violations.length >= 5) {
        user.isBanned = true;
        user.banReason = 'Exceeded violation limit';
        // Set a default ban duration, e.g., 7 days
        user.banExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
      }
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Ban a user
// @route   PUT /api/admin/users/:id/ban
// @access  Admin
exports.banUser = async (req, res) => {
  const { reason, durationInDays } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isBanned = true;
      user.banReason = reason;
      user.banExpires = Date.now() + durationInDays * 24 * 60 * 60 * 1000;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a new admin
// @route   PUT /api/admin/users/add-admin
// @access  Admin
exports.addAdmin = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.isAdmin = true;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Admin
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('reporter', 'name')
      .populate('reportedUser', 'name');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a report's status
// @route   PUT /api/admin/reports
// @access  Admin
exports.updateReport = async (req, res) => {
  const { reportId, status, adminAction } = req.body;
  try {
    const report = await Report.findById(reportId);
    if (report) {
      report.status = status;
      report.adminAction = adminAction;
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
