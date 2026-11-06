const db = require('../config/db');

const createTradeOffer = async ({ requestedItemId, proposedItemId, senderUserId, receiverUserId }) => {
  const result = await db.query(
    `
      INSERT INTO trade_offers (requested_item_id, proposed_item_id, sender_user_id, receiver_user_id, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `,
    [requestedItemId, proposedItemId, senderUserId, receiverUserId]
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query('SELECT * FROM trade_offers WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const listForUser = async (userId) => {
  const result = await db.query(
    `
      SELECT *
      FROM trade_offers
      WHERE sender_user_id = $1 OR receiver_user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );
  return result.rows;
};

const updateStatus = async (id, status) => {
  const result = await db.query(
    'UPDATE trade_offers SET status = $2 WHERE id = $1 RETURNING *',
    [id, status]
  );
  return result.rows[0] || null;
};

module.exports = {
  createTradeOffer,
  findById,
  listForUser,
  updateStatus
};
