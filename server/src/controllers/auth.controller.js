const authService = require('../services/auth.service');
const { User, Matchmaker, Member } = require('../models');
const { success, error } = require('../utils/response');
const { verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const authController = {
  /**
   * Send SMS verification code
   * POST /api/auth/sms/send
   */
  async sendSms(req, res, next) {
    try {
      const { phone, type } = req.body;

      const code = await authService.generateSmsCode(phone, type);

      // In development, return the code directly (skip real SMS)
      const responseData = { phone, type };
      if (process.env.NODE_ENV !== 'production') {
        responseData.code = code;
      }

      return success(res, responseData, '验证码发送成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * SMS code login
   * POST /api/auth/sms/login
   */
  async smsLogin(req, res, next) {
    try {
      const { phone, code, inviteCode } = req.body;

      // Verify SMS code
      const isValid = await authService.verifySmsCode(phone, code, 'login');
      if (!isValid) {
        return error(res, '验证码无效或已过期', 40001);
      }

      // Find or create user
      const { user, isNewUser } = await authService.findOrCreateUserByPhone(phone);

      // Check user status
      if (user.status === 0) {
        return error(res, '账号已被禁用', 40003);
      }

      // 新用户通过邀请链接注册，自动成为红娘的会员
      if (isNewUser && inviteCode) {
        try {
          const matchmakerIdStr = inviteCode.replace(/^MBR0*/, '');
          const mmId = Number(matchmakerIdStr);
          if (mmId > 0) {
            const inviterMM = await Matchmaker.findByPk(mmId);
            if (inviterMM) {
              const existing = await Member.findOne({
                where: { matchmakerId: inviterMM.id, userId: user.id }
              });
              if (!existing) {
                await Member.create({
                  matchmakerId: inviterMM.id,
                  userId: user.id,
                  memberType: 'free',
                  status: 1,
                  remark: '通过邀请链接注册'
                });
                logger.info(`New member via invite: user ${user.id} -> matchmaker ${inviterMM.id}`);
              }
            }
          }
        } catch (inviteErr) {
          logger.warn(`Failed to process inviteCode ${inviteCode}: ${inviteErr.message}`);
        }
      }

      // Check if user has matchmaker role
      const matchmaker = await Matchmaker.findOne({ where: { userId: user.id } });

      // Generate tokens
      const tokens = authService.generateTokens(user);

      return success(res, {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          gender: user.gender,
          currentRole: user.currentRole,
          isVerified: user.isVerified,
          profileCompletion: user.profileCompletion,
          hasMatchmakerRole: !!matchmaker
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        isNewUser
      }, '登录成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Password login
   * POST /api/auth/password/login
   */
  async passwordLogin(req, res, next) {
    try {
      const { phone, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { phone } });
      if (!user) {
        return error(res, '手机号或密码错误', 40001);
      }

      // Check if password is set
      if (!user.passwordHash) {
        return error(res, '未设置密码，请使用验证码登录', 40002);
      }

      // Verify password
      const isMatch = await authService.verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return error(res, '手机号或密码错误', 40001);
      }

      // Check user status
      if (user.status === 0) {
        return error(res, '账号已被禁用', 40003);
      }

      // Update last login time
      await user.update({ lastLoginAt: new Date() });

      // Check if user has matchmaker role
      const matchmaker = await Matchmaker.findOne({ where: { userId: user.id } });

      // Generate tokens
      const tokens = authService.generateTokens(user);

      return success(res, {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          gender: user.gender,
          currentRole: user.currentRole,
          isVerified: user.isVerified,
          profileCompletion: user.profileCompletion,
          hasMatchmakerRole: !!matchmaker
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        isNewUser: false
      }, '登录成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * WeChat login (stub)
   * POST /api/auth/wechat/login
   */

  async wechatLogin(req, res, next) {
    try {
      return error(res, '微信登录暂未配置', 40004);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Username registration
   * POST /api/auth/username/register
   */
  async usernameRegister(req, res, next) {
    try {
      const { username, password, nickname, role } = req.body;
      const registerAsMatchmaker = role === 'matchmaker';

      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return error(res, '用户名已被注册', 40002);
      }

      const passwordHash = await authService.hashPassword(password);

      const user = await User.create({
        username,
        passwordHash,
        nickname: nickname || username,
        currentRole: registerAsMatchmaker ? 'matchmaker' : 'user',
        status: 1
      });

      const { Wallet, Matchmaker } = require('../models');
      await Wallet.create({
        userId: user.id,
        availableAmount: 0,
        frozenAmount: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        xiCoins: 0
      });

      if (registerAsMatchmaker) {
        const matchmakerNo = `MM${Date.now()}${user.id}`.slice(0, 20);
        await Matchmaker.create({
          userId: user.id,
          matchmakerNo,
          level: 1,
          certificationStatus: 0,
          totalPerformance: 0,
          status: 1
        });
      }

      const tokens = authService.generateTokens(user);

      logger.info(`New user registered via username: ${user.id}, username: ${username}, role: ${user.currentRole}`);

      return success(res, {
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          gender: user.gender,
          currentRole: user.currentRole,
          isVerified: user.isVerified,
          profileCompletion: user.profileCompletion,
          hasMatchmakerRole: registerAsMatchmaker
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        isNewUser: true
      }, '注册成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Username + password login
   * POST /api/auth/username/login
   */
  async usernameLogin(req, res, next) {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return error(res, '用户名或密码错误', 40001);
      }

      if (!user.passwordHash) {
        return error(res, '未设置密码', 40002);
      }

      const isMatch = await authService.verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return error(res, '用户名或密码错误', 40001);
      }

      if (user.status === 0) {
        return error(res, '账号已被禁用', 40003);
      }

      await user.update({ lastLoginAt: new Date() });

      const tokens = authService.generateTokens(user);

      // Check if user has matchmaker role
      const matchmaker = await Matchmaker.findOne({ where: { userId: user.id } });

      return success(res, {
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          gender: user.gender,
          currentRole: user.currentRole,
          isVerified: user.isVerified,
          profileCompletion: user.profileCompletion,
          hasMatchmakerRole: !!matchmaker,
          isAdmin: !!user.isAdmin
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        isNewUser: false
      }, '登录成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Refresh access token
   * POST /api/auth/token/refresh
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken: token } = req.body;

      if (!token) {
        return error(res, 'refreshToken不能为空', 40001);
      }

      const decoded = verifyRefreshToken(token);
      if (!decoded) {
        return error(res, 'refreshToken无效或已过期', 40100, 401);
      }

      // Find user to get latest data
      const user = await User.findByPk(decoded.userId);
      if (!user || user.status === 0) {
        return error(res, '用户不存在或已被禁用', 40100, 401);
      }

      // Generate new tokens
      const tokens = authService.generateTokens(user);

      return success(res, {
        token: tokens.token,
        refreshToken: tokens.refreshToken
      }, 'token刷新成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Logout
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // In a production system, you would blacklist the token in Redis
      return success(res, null, '退出登录成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Set or change password
   * POST /api/auth/password/set
   * Supports two flows:
   *   1. Authenticated with old password: { oldPassword, newPassword }
   *   2. Via SMS verification: { phone, smsCode, newPassword }
   */
  async setPassword(req, res, next) {
    try {
      const { userId } = req.user;
      const { oldPassword, newPassword, phone, smsCode } = req.body;

      if (!newPassword) {
        return error(res, '新密码不能为空', 40001);
      }

      if (newPassword.length < 6) {
        return error(res, '密码长度不能少于6位', 40001);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 40400, 404);
      }

      // Flow 1: Change password with old password verification
      if (oldPassword) {
        if (!user.passwordHash) {
          return error(res, '当前未设置密码，请使用验证码方式设置', 40002);
        }

        const isMatch = await authService.verifyPassword(oldPassword, user.passwordHash);
        if (!isMatch) {
          return error(res, '原密码错误', 40001);
        }
      }
      // Flow 2: Set password via SMS code verification
      else if (phone && smsCode) {
        const isValid = await authService.verifySmsCode(phone, smsCode, 'setPassword');
        if (!isValid) {
          return error(res, '验证码无效或已过期', 40001);
        }
      }
      // Neither flow provided
      else {
        return error(res, '请提供原密码或手机验证码', 40001);
      }

      // Hash and save new password
      const passwordHash = await authService.hashPassword(newPassword);
      await user.update({ passwordHash });

      logger.info(`User ${userId} password updated`);

      return success(res, null, '密码设置成功');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Bind phone number to WeChat-authenticated user
   * POST /api/auth/wechat/bindphone
   */
  async wechatBindPhone(req, res, next) {
    try {
      const { userId } = req.user;
      const { phone, smsCode } = req.body;

      if (!phone || !smsCode) {
        return error(res, '手机号和验证码不能为空', 40001);
      }

      // Verify SMS code
      const isValid = await authService.verifySmsCode(phone, smsCode, 'bindPhone');
      if (!isValid) {
        return error(res, '验证码无效或已过期', 40001);
      }

      // Check if phone is already taken by another user
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser && existingUser.id !== userId) {
        return error(res, '该手机号已被其他账号绑定', 40002);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 40400, 404);
      }

      await user.update({ phone });

      logger.info(`User ${userId} bound phone: ${phone}`);

      return success(res, { phone }, '手机号绑定成功');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
