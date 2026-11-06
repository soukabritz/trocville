const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const google = async (req, res, next) => {
  try {
    const data = await authService.loginWithGoogle(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const data = await authService.verifyEmail(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const data = await authService.resendVerification(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const data = await authService.forgotPassword(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const data = await authService.resetPassword(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  google,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
};
