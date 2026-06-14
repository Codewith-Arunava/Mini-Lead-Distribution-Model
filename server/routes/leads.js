const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getLeads, getLead, createLead, updateLead, deleteLead } = require('../controllers/leadController');
const { importCSV } = require('../controllers/importController');
const { protect, adminOnly } = require('../middleware/auth');

// Multer — store CSV in memory (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

// CSV Import (admin only)
router.post('/import', protect, adminOnly, upload.single('file'), importCSV);

// Lead CRUD
router.route('/').get(protect, getLeads).post(protect, adminOnly, createLead);
router.route('/:id').get(protect, getLead).put(protect, updateLead).delete(protect, adminOnly, deleteLead);

module.exports = router;
