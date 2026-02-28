const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get conversations list
router.get('/conversations', messageController.getConversations);

// Get messages in a conversation
router.get('/conversation/:id', messageController.getMessages);

// Send a message
router.post('/send', messageController.sendMessage);

// Mark messages as read
router.put('/read/:id', messageController.markAsRead);

// Get unread message count
router.get('/unread-count', messageController.getUnreadCount);

// Delete a conversation
router.delete('/conversation/:id', messageController.deleteConversation);

module.exports = router;
