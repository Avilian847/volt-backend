const express = require('express');
const router = express.Router();
const { placeOrder, getOrders } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, placeOrder);
router.get('/',  verifyToken, getOrders);

module.exports = router;