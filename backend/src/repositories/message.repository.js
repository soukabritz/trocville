const db = require('../config/db');

const createMessage = async ({ conversationId, senderUserId, content }) => {
  const result = await db.query(
    `
      INSERT INTO messages (conversation_id, sender_user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [conversationId, senderUserId, content]
  );
  return result.rows[0];
};

const listByConversation = async (conversationId) => {
  const result = await db.query(
    `
      SELECT m.*, u.first_name, u.last_name
      FROM messages m
      JOIN users u ON u.id = m.sender_user_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `,
    [conversationId]
  );
  return result.rows;
};

module.exports = {
  createMessage,
  listByConversation
};
