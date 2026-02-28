const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, '未登录或token已过期', 40100, 401);
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return error(res, 'token无效或已过期', 40100, 401);
  }

  req.user = {
    userId: decoded.userId,
    phone: decoded.phone,
    currentRole: decoded.currentRole
  };

  next();
};

module.exports = authMiddleware;
