const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All routes require authentication and matchmaker role
router.use(authMiddleware);
router.use(requireRole('matchmaker'));

// Get member invite code
router.get('/invite-code', memberController.getInviteCode);

// List members
router.get('/list', memberController.list);

// Add a new member
router.post('/add', memberController.add);

// Search members
router.get('/search', memberController.search);

// Get member stats
router.get('/stats', memberController.getStats);

// Recommend own member to a resource (cross-matchmaker)
router.post('/recommend', memberController.recommend);

// Get member detail (must be after /list, /search, /stats to avoid path conflicts)
router.get('/:id', memberController.getDetail);

// Update member profile
router.put('/:id/profile', memberController.updateProfile);

// Update member rights/type
router.put('/:id/rights', memberController.updateRights);

// Speed match for a member
router.post('/:id/speed-match', memberController.speedMatch);

// Send greeting message to member
router.post('/:id/greet', memberController.greet);

module.exports = router;
