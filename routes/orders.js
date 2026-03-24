const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: 'place order route working' });
});

router.get('/', (req, res) => {
  res.json({ message: 'get order history route working' });
});

module.exports = router;