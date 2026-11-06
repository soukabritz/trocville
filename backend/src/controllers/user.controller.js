const userService = require('../services/user.service');

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const user = await userService.getPublicProfile(Number(req.params.id));
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  getPublicProfile
};
