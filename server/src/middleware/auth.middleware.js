const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, '未登录或token已过期', 40100, 401);
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return error(res, 'token无效或已过期', 40100, 401);
  }

  try {
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'phone', 'currentRole', 'status']
    });

    if (!user) {
      return error(res, '用户不存在或已被删除', 40100, 401);
    }

    if (user.status === 0) {
      return error(res, '账号已被禁用', 40300, 403);
    }

    req.user = {
      userId: user.id,
      phone: user.phone,
      currentRole: user.currentRole
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;
