const db = require('../config/db');

const createUser = async ({
  firstName,
  lastName,
  email,
  passwordHash,
  mainCity,
  googleSub = null,
  emailVerified = false,
  termsAcceptedAt = null
}) => {
  const query = `
    INSERT INTO users (
      first_name, last_name, email, password_hash, main_city, credits, google_sub, email_verified, terms_accepted_at
    )
    VALUES ($1, $2, $3, $4, $5, 200, $6, $7, $8)
    RETURNING id, first_name, last_name, email, main_city, credits, created_at, email_verified
  `;
  const result = await db.query(query, [
    firstName,
    lastName,
    email,
    passwordHash,
    mainCity,
    googleSub,
    emailVerified,
    termsAcceptedAt
  ]);
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

const findByEmailInsensitive = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email]);
  return result.rows[0] || null;
};

const findByGoogleSub = async (googleSub) => {
  const result = await db.query('SELECT * FROM users WHERE google_sub = $1', [googleSub]);
  return result.rows[0] || null;
};

const attachGoogle = async (id, googleSub) => {
  const result = await db.query(
    `
      UPDATE users
      SET google_sub = $2
      WHERE id = $1
      RETURNING id, first_name, last_name, email, main_city, credits, created_at
    `,
    [id, googleSub]
  );
  return result.rows[0] || null;
};

const markEmailVerified = async (id) => {
  const result = await db.query(
    `
      UPDATE users
      SET email_verified = TRUE
      WHERE id = $1
      RETURNING id, first_name, last_name, email, main_city, credits, created_at, email_verified
    `,
    [id]
  );
  return result.rows[0] || null;
};

const deleteById = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

const updatePassword = async (id, passwordHash) => {
  const result = await db.query(
    `
      UPDATE users
      SET password_hash = $2, email_verified = TRUE
      WHERE id = $1
      RETURNING id, first_name, last_name, email, main_city, credits, created_at
    `,
    [id, passwordHash]
  );
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await db.query(
    'SELECT id, first_name, last_name, email, main_city, credits, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

const updateProfile = async (id, { firstName, lastName, mainCity }) => {
  const result = await db.query(
    `
      UPDATE users
      SET first_name = $2, last_name = $3, main_city = $4
      WHERE id = $1
      RETURNING id, first_name, last_name, email, main_city, credits, created_at
    `,
    [id, firstName, lastName, mainCity]
  );
  return result.rows[0] || null;
};

module.exports = {
  createUser,
  findByEmail,
  findByEmailInsensitive,
  findByGoogleSub,
  attachGoogle,
  markEmailVerified,
  deleteById,
  updatePassword,
  findById,
  updateProfile
};
