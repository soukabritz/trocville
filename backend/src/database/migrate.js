const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const migrate = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const directory = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(directory).filter((name) => name.endsWith('.sql')).sort();

  for (const file of files) {
    const alreadyApplied = await db.query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [file]
    );
    if (alreadyApplied.rowCount) {
      continue;
    }

    const sql = fs.readFileSync(path.join(directory, file), 'utf8');
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Migration appliquée : ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = migrate;
