const express = require('express');
const router = express.Router();
const { getAll, updateBulk } = require('../controllers/settingsController');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

// Public read (optional).
router.get('/', getAll);

// Admin update (requires auth then adminAuth)
router.put('/', auth, adminAuth, updateBulk);

module.exports = router;
