const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salon.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All routes require authentication
router.use(authMiddleware);

// List salon events (all authenticated users)
router.get('/events', salonController.getEvents);

// Get current user's registrations (must be before /events/:id to avoid path conflict)
router.get('/my-registrations', salonController.getMyRegistrations);

// Get matchmaker's own created events (must be before /events/:id)
router.get('/my-events', requireRole('matchmaker'), salonController.getMyEvents);

// Get salon event detail
router.get('/events/:id', salonController.getEventDetail);

// Register for a salon event
router.post('/events/:id/register', salonController.register);

// Cancel registration for a salon event
router.delete('/events/:id/register', salonController.cancelRegistration);

// === Matchmaker-only routes ===
// Create a salon event
router.post('/events', requireRole('matchmaker'), salonController.createEvent);

// Update a salon event
router.put('/events/:id', requireRole('matchmaker'), salonController.updateEvent);

// Cancel a salon event
router.put('/events/:id/cancel', requireRole('matchmaker'), salonController.cancelEvent);

// Invite members to a salon event
router.post('/events/:id/invite', requireRole('matchmaker'), salonController.inviteMembers);

module.exports = router;
