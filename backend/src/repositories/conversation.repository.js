const db = require('../config/db');

const createWithClient = async (client, { itemId, buyerUserId, sellerUserId }) => {
  const result = await client.query(
    `
      INSERT INTO conversations (item_id, buyer_user_id, seller_user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (item_id, buyer_user_id)
      DO UPDATE SET item_id = EXCLUDED.item_id
      RETURNING *
    `,
    [itemId, buyerUserId, sellerUserId]
  );
  return result.rows[0];
};

const findOrCreate = async ({ itemId, buyerUserId, sellerUserId }) => {
  const result = await db.query(
    `
      INSERT INTO conversations (item_id, buyer_user_id, seller_user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (item_id, buyer_user_id)
      DO UPDATE SET item_id = EXCLUDED.item_id
      RETURNING *
    `,
    [itemId, buyerUserId, sellerUserId]
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const listForUser = async (userId) => {
  const result = await db.query(
    `
      SELECT
        c.*,
        i.title AS item_title,
        i.image_url AS item_image_url,
        i.city AS item_city,
        CASE
          WHEN c.buyer_user_id = $1 THEN seller.first_name
          ELSE buyer.first_name
        END AS other_first_name,
        CASE
          WHEN c.buyer_user_id = $1 THEN seller.last_name
          ELSE buyer.last_name
        END AS other_last_name,
        (
          SELECT COUNT(*)::int
          FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_user_id <> $1
            AND m.created_at > COALESCE(
              CASE
                WHEN c.buyer_user_id = $1 THEN c.buyer_last_read_at
                ELSE c.seller_last_read_at
              END,
              TIMESTAMP '1970-01-01'
            )
        ) AS unread_count,
        last_message.content AS last_message,
        last_message.created_at AS last_message_at,
        (last_message.sender_user_id = $1) AS last_message_mine
      FROM conversations c
      JOIN items i ON i.id = c.item_id
      JOIN users buyer ON buyer.id = c.buyer_user_id
      JOIN users seller ON seller.id = c.seller_user_id
      LEFT JOIN LATERAL (
        SELECT m.content, m.sender_user_id, m.created_at
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC, m.id DESC
        LIMIT 1
      ) last_message ON TRUE
      WHERE c.buyer_user_id = $1 OR c.seller_user_id = $1
      ORDER BY COALESCE(last_message.created_at, c.created_at) DESC
    `,
    [userId]
  );
  return result.rows;
};

const markRead = async (conversationId, userId) => {
  await db.query(
    `
      UPDATE conversations
      SET buyer_last_read_at = CASE WHEN buyer_user_id = $2 THEN NOW() ELSE buyer_last_read_at END,
          seller_last_read_at = CASE WHEN seller_user_id = $2 THEN NOW() ELSE seller_last_read_at END
      WHERE id = $1 AND (buyer_user_id = $2 OR seller_user_id = $2)
    `,
    [conversationId, userId]
  );
};

const countUnreadForUser = async (userId) => {
  const result = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE (c.buyer_user_id = $1 OR c.seller_user_id = $1)
        AND m.sender_user_id <> $1
        AND m.created_at > COALESCE(
          CASE
            WHEN c.buyer_user_id = $1 THEN c.buyer_last_read_at
            ELSE c.seller_last_read_at
          END,
          TIMESTAMP '1970-01-01'
        )
    `,
    [userId]
  );
  return result.rows[0].count;
};

module.exports = {
  createWithClient,
  findOrCreate,
  findById,
  listForUser,
  markRead,
  countUnreadForUser
};
