const db = require('../config/db');

const listCategories = async () => {
  const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

module.exports = {
  listCategories
};
