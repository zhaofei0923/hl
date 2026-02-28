const { error } = require('../utils/response');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, '未登录', 40100, 401);
    }

    if (!roles.includes(req.user.currentRole)) {
      return error(res, '没有权限执行此操作', 40300, 403);
    }

    next();
  };
};

module.exports = { requireRole };
