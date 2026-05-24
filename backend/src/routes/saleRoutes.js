const express = require('express');
const { createSale, getSales, getSaleById } = require('../controllers/saleController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createSale);
router.get('/', requireAuth, getSales);
router.get('/:id', requireAuth, getSaleById);

module.exports = router;
