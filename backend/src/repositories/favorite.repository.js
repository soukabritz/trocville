const db = require('../config/db');

const find = async (userId, itemId) => {
  const result = await db.query(
    'SELECT user_id, item_id FROM favorites WHERE user_id = $1 AND item_id = $2',
    [userId, itemId]
  );
  return result.rows[0] || null;
};

const add = async (userId, itemId) => {
  await db.query(
    'INSERT INTO favorites (user_id, item_id) VALUES ($1, $2) ON CONFLICT (user_id, item_id) DO NOTHING',
    [userId, itemId]
  );
};

const remove = async (userId, itemId) => {
  await db.query('DELETE FROM favorites WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
};

const listForUser = async (userId) => {
  const result = await db.query(
    `
      SELECT
        i.*,
        c.name AS category_name,
        u.first_name,
        u.last_name,
        u.main_city
      FROM favorites f
      JOIN items i ON i.id = f.item_id
      JOIN categories c ON c.id = i.category_id
      JOIN users u ON u.id = i.user_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `,
    [userId]
  );
  return result.rows;
};

const listItemIdsForUser = async (userId) => {
  const result = await db.query('SELECT item_id FROM favorites WHERE user_id = $1', [userId]);
  return result.rows.map((row) => Number(row.item_id));
};

module.exports = {
  find,
  add,
  remove,
  listForUser,
  listItemIdsForUser
};
