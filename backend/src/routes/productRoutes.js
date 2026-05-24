const express = require('express');
const {
  getProducts,
  searchProducts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  
} = require('../controllers/productController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getProducts);
router.get('/search', requireAuth, searchProducts);
router.post('/', requireAuth, requireRole('admin'), createProduct);
router.put('/:id', requireAuth, requireRole('admin'), updateProduct);
router.patch('/:id/stock', requireAuth, requireRole('admin'), updateStock);
router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct);

module.exports = router;
