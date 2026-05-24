const express = require('express');
const { getLowStockProducts, getStockHistory } = require('../controllers/inventoryController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/low-stock', requireAuth, requireRole('admin'), getLowStockProducts);
router.get('/history', requireAuth, requireRole('admin'), getStockHistory);

module.exports = router;
