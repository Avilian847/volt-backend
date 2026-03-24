const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  res.json({ message: 'register route working' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'login route working' });
});

module.exports = router;