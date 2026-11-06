const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const { toPublicUser } = require('../utils/mapUser');

const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('Utilisateur introuvable.', 404);
  }
  return toPublicUser(user);
};

const updateProfile = async (userId, payload) => {
  const updated = await userRepository.updateProfile(userId, payload);
  if (!updated) {
    throw new AppError('Utilisateur introuvable.', 404);
  }
  return toPublicUser(updated);
};

const getPublicProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('Utilisateur introuvable.', 404);
  }
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    mainCity: user.main_city,
    credits: user.credits
  };
};

module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile
};
