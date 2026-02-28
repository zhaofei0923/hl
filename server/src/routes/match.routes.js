const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get daily match recommendations (今日缘分)
router.get('/daily', matchController.getDailyMatches);

// Get recommendations with filters
router.get('/recommend', matchController.getRecommendations);

// Get mutual matches
router.get('/mutual', matchController.getMutualMatches);

// Express interest (like) in another user
router.post('/like/:userId', matchController.likeUser);

module.exports = router;
