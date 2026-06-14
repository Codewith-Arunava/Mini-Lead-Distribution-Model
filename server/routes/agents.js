const express = require('express');
const router = express.Router();
const { getAgents, createAgent, updateAgent, deleteAgent } = require('../controllers/agentController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.route('/').get(getAgents).post(createAgent);
router.route('/:id').put(updateAgent).delete(deleteAgent);

module.exports = router;
