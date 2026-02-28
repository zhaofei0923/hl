const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Wallet, SmsCode } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const authService = {
  /**
   * Generate a 6-digit SMS verification code
   */
  async generateSmsCode(phone, type) {
    // Generate random 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate any existing unused codes for this phone+type
    await SmsCode.update(
      { isUsed: 1 },
      {
        where: {
          phone,
          type,
          isUsed: 0
        }
      }
    );

    // Create new code
    await SmsCode.create({
      phone,
      code,
      type,
      isUsed: 0,
      expiresAt
    });

    logger.info(`SMS code generated for ${phone}: ${code} (type: ${type})`);
    return code;
  },

  /**
   * Verify an SMS code
   */
  async verifySmsCode(phone, code, type) {
    const smsCode = await SmsCode.findOne({
      where: {
        phone,
        code,
        type,
        isUsed: 0,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [['created_at', 'DESC']]
    });

    if (!smsCode) {
      return false;
    }

    // Mark as used
    await smsCode.update({ isUsed: 1 });
    return true;
  },

  /**
   * Find or create user by phone number
   */
  async findOrCreateUserByPhone(phone) {
    let isNewUser = false;
    let user = await User.findOne({ where: { phone } });

    if (!user) {
      isNewUser = true;
      user = await User.create({
        phone,
        nickname: `用户${phone.slice(-4)}`,
        currentRole: 'user',
        status: 1
      });

      // Create wallet for new user
      await Wallet.create({
        userId: user.id,
        availableAmount: 0,
        frozenAmount: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        xiCoins: 0
      });

      logger.info(`New user created: ${user.id}, phone: ${phone}`);
    }

    // Update last login time
    await user.update({ lastLoginAt: new Date() });

    return { user, isNewUser };
  },

  /**
   * Hash a password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  /**
   * Generate access token and refresh token pair
   */
  generateTokens(user) {
    const payload = {
      userId: user.id,
      phone: user.phone,
      currentRole: user.currentRole
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { token, refreshToken };
  }
};

module.exports = authService;
