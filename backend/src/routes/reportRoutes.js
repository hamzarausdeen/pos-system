const express = require('express');
const {
  dailyReport,
  monthlyReport,
  annualReport,
  profitReport,
  stockReport,
  bestSellingProducts
} = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', requireAuth, requireRole('admin'), dailyReport);
router.get('/monthly', requireAuth, requireRole('admin'), monthlyReport);
router.get('/annual', requireAuth, requireRole('admin'), annualReport);
router.get('/profit', requireAuth, requireRole('admin'), profitReport);
router.get('/stock', requireAuth, requireRole('admin'), stockReport);
router.get('/best-selling', requireAuth, requireRole('admin'), bestSellingProducts);

module.exports = router;
