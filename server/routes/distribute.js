const express = require('express');
const router = express.Router();
const { distribute } = require('../controllers/distributeController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, adminOnly, distribute);

module.exports = router;
