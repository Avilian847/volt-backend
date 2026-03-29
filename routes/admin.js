const express = require('express');
const router = express.Router();
const { getAllOrders, updateOrderStatus, getAllUsers } = require('../controllers/adminController');
const { createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/orders',        verifyAdmin, getAllOrders);
router.put('/orders/:id',    verifyAdmin, updateOrderStatus);
router.get('/users',         verifyAdmin, getAllUsers);
router.post('/products',     verifyAdmin, createProduct);
router.put('/products/:id',  verifyAdmin, updateProduct);
router.delete('/products/:id', verifyAdmin, deleteProduct);

module.exports = router;