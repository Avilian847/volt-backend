const express = require('express');
const router = express.Router();
const { placeOrder, getOrders } = require('../controllers/orderController');
const { stkPush, mpesaCallback } = require('../controllers/mpesaController');
const { verifyToken } = require('../middleware/auth');

router.post('/',                verifyToken, placeOrder);
router.get('/',                 verifyToken, getOrders);
router.post('/mpesa/stk',       verifyToken, stkPush);
router.post('/mpesa/callback',  mpesaCallback);

module.exports = router;