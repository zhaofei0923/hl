const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const salonController = require('../controllers/salon.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function imageFileFilter(req, file, cb) {
	const ext = path.extname(file.originalname).toLowerCase();
	cb(null, allowedImageExtensions.has(ext) && allowedImageMimeTypes.has(file.mimetype));
}

const upload = multer({
	dest: path.join(__dirname, '../../uploads/photos'),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: imageFileFilter
});

// All routes require authentication
router.use(authMiddleware);

// Upload salon cover image
router.post('/upload-cover', requireRole('matchmaker'), upload.single('cover'), salonController.uploadCover);

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
