const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Multer configuration for avatar uploads
const upload = multer({
  dest: path.join(__dirname, '../../uploads/avatars'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpg|jpeg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});

// All routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update basic user info
router.put('/profile', userController.updateProfile);

// Update detailed profile
router.put('/profile/detail', userController.updateProfileDetail);

// Switch role (user <-> matchmaker)
router.put('/role/switch', userController.switchRole);

// Upload avatar
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

// Get certification status
router.get('/certification', userController.getCertification);

// Submit certification application
router.post('/certification', userController.submitCertification);

// Get public profile of any user by ID
router.get('/public/:id', userController.getPublicProfile);

module.exports = router;
