const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const list = errors.array();
    const fields = {};
    list.forEach((error) => {
      const key = error.path;
      if (key && !fields[key]) {
        fields[key] = error.msg;
      }
    });
    const validationError = new AppError(list[0].msg, 422);
    validationError.fields = fields;
    return next(validationError);
  }

  return next();
};

module.exports = validateRequest;
