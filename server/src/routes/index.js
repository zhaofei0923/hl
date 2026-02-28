const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const matchmakerRoutes = require('./matchmaker.routes');
const memberRoutes = require('./member.routes');
const walletRoutes = require('./wallet.routes');
const messageRoutes = require('./message.routes');
const matchRoutes = require('./match.routes');
const salonRoutes = require('./salon.routes');
const adminRoutes = require('./admin.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/matchmaker', matchmakerRoutes);
router.use('/member', memberRoutes);
router.use('/wallet', walletRoutes);
router.use('/message', messageRoutes);
router.use('/match', matchRoutes);
router.use('/salon', salonRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
