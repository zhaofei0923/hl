const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { sendSmsValidation, smsLoginValidation, passwordLoginValidation, resetPasswordValidation, usernameRegisterValidation, usernameLoginValidation } = require('../validators/auth.validator');
const authMiddleware = require('../middleware/auth.middleware');

// Send SMS verification code
router.post('/sms/send', validate(sendSmsValidation), authController.sendSms);

// SMS code login
router.post('/sms/login', validate(smsLoginValidation), authController.smsLogin);

// Password login
router.post('/password/login', validate(passwordLoginValidation), authController.passwordLogin);

// Reset password via SMS verification code
router.post('/password/reset', validate(resetPasswordValidation), authController.resetPassword);

// WeChat login (stub)
router.post('/wechat/login', authController.wechatLogin);

// Username registration
router.post('/username/register', validate(usernameRegisterValidation), authController.usernameRegister);

// Username + password login
router.post('/username/login', validate(usernameLoginValidation), authController.usernameLogin);

// Refresh token
router.post('/token/refresh', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Set or change password (requires authentication)
router.post('/password/set', authMiddleware, authController.setPassword);

// Bind phone to WeChat-authenticated user (requires authentication)
router.post('/wechat/bindphone', authMiddleware, authController.wechatBindPhone);

module.exports = router;
