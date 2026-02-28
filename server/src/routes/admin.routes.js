const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/admin.middleware');
const adminController = require('../controllers/admin.controller');

// All admin routes require admin authentication
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/user-trend', adminController.getUserTrend);
router.get('/dashboard/order-distribution', adminController.getOrderTypeDistribution);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.put('/users/:id/status', adminController.updateUserStatus);

// Matchmaker Management
router.get('/matchmakers', adminController.getMatchmakers);
router.get('/matchmakers/:id', adminController.getMatchmakerDetail);
router.put('/matchmakers/:id/certification', adminController.updateCertification);
router.put('/matchmakers/:id/level', adminController.updateLevel);

// Withdrawal Management
router.get('/withdrawals', adminController.getWithdrawals);
router.put('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.put('/withdrawals/:id/reject', adminController.rejectWithdrawal);

// Order Management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetail);

// Salon Management
router.get('/salons', adminController.getSalons);
router.get('/salons/:id', adminController.getSalonDetail);
router.post('/salons', adminController.createSalon);
router.put('/salons/:id', adminController.updateSalon);
router.put('/salons/:id/status', adminController.updateSalonStatus);

module.exports = router;
