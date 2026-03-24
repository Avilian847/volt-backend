const express = require('express');
const router = express.Router();

router.get('/products', (req, res) => {
  res.json({ message: 'admin get products route working' });
});

router.post('/products', (req, res) => {
  res.json({ message: 'admin add product route working' });
});

router.put('/products/:id', (req, res) => {
  res.json({ message: `admin update product ${req.params.id} route working` });
});

router.delete('/products/:id', (req, res) => {
  res.json({ message: `admin delete product ${req.params.id} route working` });
});

router.get('/orders', (req, res) => {
  res.json({ message: 'admin get orders route working' });
});

router.put('/orders/:id', (req, res) => {
  res.json({ message: `admin update order ${req.params.id} route working` });
});

module.exports = router;