const db = require('../config/db');

const replaceCode = async ({ userId, codeHash, expiresAt }) => {
  await db.query('DELETE FROM email_verification_codes WHERE user_id = $1', [userId]);
  await db.query(
    `
      INSERT INTO email_verification_codes (user_id, code_hash, expires_at)
      VALUES ($1, $2, $3)
    `,
    [userId, codeHash, expiresAt]
  );
};

const findLatest = async (userId) => {
  const result = await db.query(
    `
      SELECT code_hash, expires_at
      FROM email_verification_codes
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
};

const deleteForUser = async (userId) => {
  await db.query('DELETE FROM email_verification_codes WHERE user_id = $1', [userId]);
};

module.exports = {
  replaceCode,
  findLatest,
  deleteForUser
};
