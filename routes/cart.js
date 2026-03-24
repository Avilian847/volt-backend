const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'get cart route working' });
});

router.post('/', (req, res) => {
  res.json({ message: 'add to cart route working' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `update cart item ${req.params.id} route working` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `remove cart item ${req.params.id} route working` });
});

module.exports = router;