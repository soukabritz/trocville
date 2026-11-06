const categoryRepository = require('../repositories/category.repository');

const listCategories = async (_req, res, next) => {
  try {
    const categories = await categoryRepository.listCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCategories
};
