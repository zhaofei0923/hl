const { body } = require('express-validator');

const sendSmsValidation = [
  body('phone')
    .notEmpty().withMessage('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('type')
    .notEmpty().withMessage('验证码类型不能为空')
    .isIn(['login', 'register', 'reset_password', 'bind_phone', 'setPassword']).withMessage('验证码类型不正确')
];

const smsLoginValidation = [
  body('phone')
    .notEmpty().withMessage('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('code')
    .notEmpty().withMessage('验证码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('验证码必须为6位')
];

const passwordLoginValidation = [
  body('phone')
    .notEmpty().withMessage('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 32 }).withMessage('密码长度为6-32位')
];

const usernameRegisterValidation = [
  body('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度为3-20位')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/).withMessage('用户名只能包含字母、数字、下划线或中文'),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 32 }).withMessage('密码长度为6-32位'),
  body('nickname')
    .optional()
    .isLength({ max: 64 }).withMessage('昵称最长64个字符')
];

const usernameLoginValidation = [
  body('username')
    .notEmpty().withMessage('用户名不能为空'),
  body('password')
    .notEmpty().withMessage('密码不能为空')
];

module.exports = {
  sendSmsValidation,
  smsLoginValidation,
  passwordLoginValidation,
  usernameRegisterValidation,
  usernameLoginValidation
};
