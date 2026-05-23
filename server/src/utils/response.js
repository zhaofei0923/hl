/**
 * Standardized API response helpers
 */

const success = (res, data = null, message = 'success', statusCode = 200) => {
  return res.status(statusCode).json({
    code: 0,
    message,
    data
  });
};

const error = (res, message = 'error', code = 40000, statusCode = 400) => {
  return res.status(statusCode).json({
    code,
    message,
    data: null
  });
};

const paginate = (res, { list, total, page, pageSize, ...extra }) => {
  return res.status(200).json({
    code: 0,
    message: 'success',
    data: {
      list,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize)
      },
      ...extra
    }
  });
};

module.exports = {
  success,
  error,
  paginate
};
