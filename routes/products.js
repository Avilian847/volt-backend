const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'get all products route working' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `get product ${req.params.id} route working` });
});

module.exports = router;