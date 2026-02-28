const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get wallet info
router.get('/info', walletController.getInfo);

// Get earnings list
router.get('/earnings', walletController.getEarnings);

// Get earnings summary
router.get('/earnings/summary', walletController.getEarningsSummary);

// Get withdrawal records
router.get('/withdrawals', walletController.getWithdrawals);

// Get transfer records
router.get('/transfers', walletController.getTransfers);

// Request withdrawal
router.post('/withdraw', walletController.withdraw);

module.exports = router;
