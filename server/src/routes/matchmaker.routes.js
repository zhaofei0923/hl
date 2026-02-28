const express = require('express');
const router = express.Router();
const matchmakerController = require('../controllers/matchmaker.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All routes require authentication
router.use(authMiddleware);

// Apply to become a matchmaker (does NOT require matchmaker role)
router.post('/apply', matchmakerController.apply);

// All routes below require matchmaker role
router.use(requireRole('matchmaker'));

// Get dashboard data
router.get('/dashboard', matchmakerController.getDashboard);

// Get matchmaker info
router.get('/info', matchmakerController.getInfo);

// Update matchmaker info
router.put('/info', matchmakerController.updateInfo);

// Get team info
router.get('/team', matchmakerController.getTeam);

// Get team member list
router.get('/team/members', matchmakerController.getTeamMembers);

// Apply for store
router.post('/store/apply', matchmakerController.applyStore);

// Get store info
router.get('/store', matchmakerController.getStore);

// Update store info
router.put('/store', matchmakerController.updateStore);

// Get subordinate matchmakers
router.get('/my-matchmakers', matchmakerController.getMyMatchmakers);

// Get invite code
router.get('/invite/code', matchmakerController.getInviteCode);

// Get invitation records
router.get('/invite/records', matchmakerController.getInviteRecords);

module.exports = router;
