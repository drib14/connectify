const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  restrictUser,
  banUser,
  addAdmin,
  getReports,
  updateReport,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/users').get(getAllUsers);
router.route('/users/:id/restrict').put(restrictUser);
router.route('/users/:id/ban').put(banUser);
router.route('/users/add-admin').put(addAdmin);
router.route('/reports').get(getReports).put(updateReport);

module.exports = router;
