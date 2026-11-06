const favoriteRepository = require('../repositories/favorite.repository');
const itemRepository = require('../repositories/item.repository');
const AppError = require('../utils/AppError');

const listMine = (userId) => favoriteRepository.listForUser(userId);

const listIds = (userId) => favoriteRepository.listItemIdsForUser(userId);

const toggle = async (userId, itemId) => {
  const item = await itemRepository.findById(itemId);
  if (!item) {
    throw new AppError('Annonce introuvable.', 404);
  }
  if (Number(item.user_id) === Number(userId)) {
    throw new AppError('Tu ne peux pas mettre tes propres annonces en favori.', 400);
  }

  const existing = await favoriteRepository.find(userId, itemId);
  if (existing) {
    await favoriteRepository.remove(userId, itemId);
    return { favorited: false, itemId };
  }

  await favoriteRepository.add(userId, itemId);
  return { favorited: true, itemId };
};

module.exports = {
  listMine,
  listIds,
  toggle
};
