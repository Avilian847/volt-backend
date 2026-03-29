const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/',     getProducts);
router.get('/:id',  getProductById);
router.post('/',    verifyAdmin, createProduct);
router.put('/:id',  verifyAdmin, updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);

module.exports = router;