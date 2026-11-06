const favoriteService = require('../services/favorite.service');

const listMine = async (req, res, next) => {
  try {
    const data = await favoriteService.listMine(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const listIds = async (req, res, next) => {
  try {
    const ids = await favoriteService.listIds(req.user.id);
    res.json({ ids });
  } catch (error) {
    next(error);
  }
};

const toggle = async (req, res, next) => {
  try {
    const result = await favoriteService.toggle(req.user.id, Number(req.params.itemId));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMine,
  listIds,
  toggle
};
