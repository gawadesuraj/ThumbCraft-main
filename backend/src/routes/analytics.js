const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth); // All analytics endpoints are secured

router.get('/summary', analyticsController.getUserAnalytics);
router.get('/logs', analyticsController.getUsageLogs);

module.exports = router;
