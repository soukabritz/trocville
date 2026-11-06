const db = require('../config/db');

const createItem = async ({ userId, categoryId, title, description, conditionState, city, imageUrl, creditPrice }) => {
  const result = await db.query(
    `
      INSERT INTO items (user_id, category_id, title, description, condition_state, city, image_url, credit_price, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'available')
      RETURNING *
    `,
    [userId, categoryId, title, description, conditionState, city, imageUrl, creditPrice]
  );
  return result.rows[0];
};

const listItems = async ({ categoryId, conditionState, cities, userId }) => {
  let query = `
    SELECT i.*, c.name AS category_name, u.first_name, u.main_city
    FROM items i
    JOIN categories c ON c.id = i.category_id
    JOIN users u ON u.id = i.user_id
    WHERE 1=1
  `;
  const values = [];

  if (userId) {
    values.push(userId);
    query += ` AND i.user_id = $${values.length}`;
  } else {
    query += ` AND i.status = 'available'`;
  }

  if (categoryId) {
    values.push(categoryId);
    query += ` AND i.category_id = $${values.length}`;
  }

  if (conditionState) {
    values.push(conditionState);
    query += ` AND i.condition_state = $${values.length}`;
  }

  if (cities && cities.length > 0) {
    values.push(cities.map((city) => city.trim().toLowerCase()));
    query += ` AND LOWER(i.city) = ANY($${values.length})`;
  }

  query += ' ORDER BY i.created_at DESC';
  const result = await db.query(query, values);
  return result.rows;
};

const findById = async (id) => {
  const result = await db.query(
    `
      SELECT i.*, c.name AS category_name, u.first_name, u.last_name, u.main_city AS owner_city
      FROM items i
      JOIN categories c ON c.id = i.category_id
      JOIN users u ON u.id = i.user_id
      WHERE i.id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
};

const updateItem = async (id, { title, description, conditionState, city, imageUrl, categoryId, creditPrice }) => {
  const result = await db.query(
    `
      UPDATE items
      SET title = $2,
          description = $3,
          condition_state = $4,
          city = $5,
          image_url = $6,
          category_id = $7,
          credit_price = $8
      WHERE id = $1
      RETURNING *
    `,
    [id, title, description, conditionState, city, imageUrl, categoryId, creditPrice]
  );
  return result.rows[0] || null;
};

const deleteItem = async (id) => {
  await db.query('DELETE FROM items WHERE id = $1', [id]);
};

const setStatus = async (id, status) => {
  await db.query('UPDATE items SET status = $2 WHERE id = $1', [id, status]);
};

const listCompletedExchanges = async (userId) => {
  const result = await db.query(
    `
      SELECT
        i.id,
        i.title,
        i.image_url,
        i.city,
        i.credit_price,
        i.acquired_at,
        i.user_id AS seller_id,
        i.acquired_by AS buyer_id,
        seller.first_name AS seller_first_name,
        seller.last_name AS seller_last_name,
        buyer.first_name AS buyer_first_name,
        buyer.last_name AS buyer_last_name,
        c.id AS conversation_id,
        CASE WHEN i.acquired_by = $1 THEN 'bought' ELSE 'sold' END AS role
      FROM items i
      JOIN users seller ON seller.id = i.user_id
      JOIN users buyer ON buyer.id = i.acquired_by
      LEFT JOIN conversations c
        ON c.item_id = i.id AND c.buyer_user_id = i.acquired_by
      WHERE i.status = 'traded'
        AND i.acquired_by IS NOT NULL
        AND (i.user_id = $1 OR i.acquired_by = $1)
      ORDER BY i.acquired_at DESC NULLS LAST, i.id DESC
    `,
    [userId]
  );
  return result.rows;
};

module.exports = {
  createItem,
  listItems,
  findById,
  updateItem,
  deleteItem,
  setStatus,
  listCompletedExchanges
};
