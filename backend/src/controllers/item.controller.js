const itemService = require('../services/item.service');

const createItem = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('Une photo de l’objet est obligatoire.');
      error.statusCode = 422;
      throw error;
    }

    const created = await itemService.createItem({
      userId: req.user.id,
      categoryId: Number(req.body.categoryId),
      title: req.body.title,
      description: req.body.description,
      conditionState: req.body.conditionState,
      city: req.body.city,
      imageUrl: `/uploads/${req.file.filename}`,
      creditPrice: Number(req.body.creditPrice)
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

const listItems = async (req, res, next) => {
  try {
    const cities = req.query.cities
      ? req.query.cities.split(',').map((city) => city.trim()).filter(Boolean)
      : [];
    const data = await itemService.listItems({
      categoryId: req.query.categoryId,
      conditionState: req.query.conditionState,
      cities,
      userId: req.query.userId
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const listExchanges = async (req, res, next) => {
  try {
    const data = await itemService.listCompletedExchanges(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getItem = async (req, res, next) => {
  try {
    const item = await itemService.getItemDetails(Number(req.params.id));
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await itemService.updateItem(Number(req.params.id), req.user.id, {
      title: req.body.title,
      description: req.body.description,
      conditionState: req.body.conditionState,
      city: req.body.city,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      categoryId: Number(req.body.categoryId),
      creditPrice: Number(req.body.creditPrice)
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const acquireItem = async (req, res, next) => {
  try {
    const result = await itemService.acquireItem(Number(req.params.id), req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await itemService.deleteItem(Number(req.params.id), req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  listItems,
  listExchanges,
  getItem,
  updateItem,
  deleteItem,
  acquireItem
};
