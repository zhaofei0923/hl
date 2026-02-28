const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error('Unhandled error:', err.message, err.stack);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message).join('; ');
    return res.status(400).json({
      code: 40000,
      message: `数据验证失败: ${messages}`,
      data: null
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors.map(e => e.path).join(', ');
    return res.status(400).json({
      code: 40000,
      message: `数据已存在: ${fields}`,
      data: null
    });
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      code: 50000,
      message: '数据库操作失败',
      data: null
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 40100,
      message: 'token无效或已过期',
      data: null
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      code: 40000,
      message: '文件大小超过限制',
      data: null
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? '服务器内部错误'
    : err.message || '服务器内部错误';

  return res.status(statusCode).json({
    code: statusCode === 500 ? 50000 : 40000,
    message,
    data: null
  });
};

module.exports = errorMiddleware;
