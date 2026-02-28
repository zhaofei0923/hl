/**
 * Admin authentication middleware
 * Verifies JWT token AND checks isAdmin flag on the user record
 */
const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');
const { User } = require('../models');

const adminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, '未登录或token已过期', 40100, 401);
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return error(res, 'token无效或已过期', 40100, 401);
  }

  // Verify admin flag from database (not just token)
  try {
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'isAdmin', 'status', 'nickname']
    });

    if (!user || user.isAdmin !== 1) {
      return error(res, '无管理员权限', 40300, 403);
    }

    if (user.status === 0) {
      return error(res, '账号已被禁用', 40300, 403);
    }

    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
      currentRole: decoded.currentRole,
      isAdmin: true
    };

    next();
  } catch (err) {
    return error(res, '认证失败', 50000, 500);
  }
};

module.exports = adminMiddleware;
